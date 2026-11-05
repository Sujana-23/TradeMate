using System.Collections.Concurrent;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using backend.models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Data.SqlClient;

namespace backend.services;

public class AuthService
{
    private readonly string _connectionString;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;
    private readonly byte[] _otpSecret;

    private readonly PasswordHasher<User> _passwordHasher = new();

    private const int MaxOtpAttempts = 5;

    private static readonly ConcurrentDictionary<string, SemaphoreSlim>
        EmailLocks = new();

    public AuthService(
        IConfiguration configuration,
        IMemoryCache cache,
        IEmailService emailService)
    {
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new InvalidOperationException(
                "TradeMate connection string missing.");

        _cache = cache;
        _emailService = emailService;

        var secret = configuration["EmailSettings:OtpSecret"]
            ?? throw new InvalidOperationException("OTP secret missing.");

        try
        {
            _otpSecret = Convert.FromBase64String(secret);

            if (_otpSecret.Length < 32)
                throw new InvalidOperationException(
                    "OTP secret must contain at least 32 bytes.");
        }
        catch (FormatException)
        {
            throw new InvalidOperationException(
                "OTP secret must be valid Base64.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        return email.Trim().ToLowerInvariant();
    }

    // REGISTRATION CACHE KEYS
    private static string OtpCacheKey(string email)
        => $"otp:{email}";

    private static string TokenCacheKey(string email)
        => $"verification:{email}";

    // FORGOT PASSWORD CACHE KEYS
    private static string ResetOtpCacheKey(string email)
        => $"password-reset-otp:{email}";

    private static string ResetVerificationCacheKey(string email)
        => $"password-reset-verification:{email}";

    private string HashOtp(string otp)
    {
        using var hmac = new HMACSHA256(_otpSecret);

        return Convert.ToHexString(
            hmac.ComputeHash(Encoding.UTF8.GetBytes(otp))
        );
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(token))
        );
    }

    private static bool HashMatches(string expected, string actual)
    {
        return CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(expected),
            Convert.FromHexString(actual)
        );
    }

    private sealed class OtpState
    {
        public required string Hash { get; init; }
        public int Attempts { get; set; }
    }

    private sealed class VerificationState
    {
        public required string Hash { get; init; }
    }

    // SEND OTP
    public async Task SendOtpAsync(string email)
    {
        email = NormalizeEmail(email);

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            var otp = OtpGenerator.GenerateOtp();

            _cache.Remove(TokenCacheKey(email));

            _cache.Set(
                OtpCacheKey(email),
                new OtpState
                {
                    Hash = HashOtp(otp),
                    Attempts = 0
                },
                TimeSpan.FromMinutes(5)
            );

            var htmlBody = EmailTemplates.OtpEmail(otp);

            try
            {
                await _emailService.SendEmailAsync(
                    email,
                    "TradeMate Email Verification",
                    htmlBody
                );
            }
            catch
            {
                _cache.Remove(OtpCacheKey(email));
                throw;
            }
        }
        finally
        {
            gate.Release();
        }
    }

    // VERIFY OTP
    public async Task<string> VerifyOtpAsync(
        string email,
        string otp)
    {
        email = NormalizeEmail(email);

        if (string.IsNullOrWhiteSpace(otp) ||
            otp.Length != 6 ||
            otp.Any(c => c < '0' || c > '9'))
        {
            throw new ArgumentException("Invalid OTP.");
        }

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            if (!_cache.TryGetValue<OtpState>(
                OtpCacheKey(email), out var state) ||
                state == null)
            {
                throw new ArgumentException(
                    "OTP expired or not found. Request a new OTP.");
            }

            state.Attempts++;

            if (state.Attempts > MaxOtpAttempts)
            {
                _cache.Remove(OtpCacheKey(email));

                throw new ArgumentException(
                    "Maximum OTP attempts exceeded. Request a new OTP.");
            }

            var submittedHash = HashOtp(otp);

            if (!HashMatches(state.Hash, submittedHash))
            {
                if (state.Attempts >= MaxOtpAttempts)
                    _cache.Remove(OtpCacheKey(email));

                throw new ArgumentException(
                    "Incorrect OTP. Please try again.");
            }

            // OTP can only be used once.
            _cache.Remove(OtpCacheKey(email));

            // Generate random one-time verification token.
            var tokenBytes = RandomNumberGenerator.GetBytes(32);

            var verificationToken = Convert.ToBase64String(tokenBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');

            _cache.Set(
                TokenCacheKey(email),
                new VerificationState
                {
                    Hash = HashToken(verificationToken)
                },
                TimeSpan.FromMinutes(10)
            );

            return verificationToken;
        }
        finally
        {
            gate.Release();
        }
    }

    // REGISTER
    public async Task<User> RegisterAsync(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            throw new ArgumentException("Passwords do not match.");

        if (!request.TermsAccepted)
            throw new ArgumentException(
                "Please accept the Terms and Conditions.");

        string email = NormalizeEmail(request.Email);

        if (string.IsNullOrWhiteSpace(request.VerificationToken))
            throw new ArgumentException(
                "Please verify your email before registering.");

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            if (!_cache.TryGetValue<VerificationState>(
                TokenCacheKey(email), out var state) ||
                state == null)
            {
                throw new ArgumentException(
                    "Email verification expired. Please verify again.");
            }

            var submittedHash = HashToken(request.VerificationToken);

            if (!HashMatches(state.Hash, submittedHash))
            {
                throw new ArgumentException(
                    "Invalid email verification token.");
            }

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string checkSql = """
                SELECT COUNT(*)
                FROM dbo.Users
                WHERE Email = @Email;
                """;

            await using var checkCommand =
                new SqlCommand(checkSql, connection);

            checkCommand.Parameters.Add(
                "@Email", SqlDbType.NVarChar, 255).Value = email;

            int exists = Convert.ToInt32(
                await checkCommand.ExecuteScalarAsync());

            if (exists > 0)
                throw new InvalidOperationException(
                    "Email is already registered.");

            var user = new User
            {
                Email = email,
                Phone = string.IsNullOrWhiteSpace(request.Phone)
                    ? null : request.Phone.Trim(),
                TermsAccepted = true,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.PasswordHash = _passwordHasher.HashPassword(
                user, request.Password);

            const string insertSql = """
                INSERT INTO dbo.Users
                    (Email, Phone, PasswordHash, TermsAccepted,
                     CreatedAt, IsActive)
                OUTPUT INSERTED.UserId
                VALUES
                    (@Email, @Phone, @PasswordHash, @TermsAccepted,
                     @CreatedAt, @IsActive);
                """;

            await using var insertCommand =
                new SqlCommand(insertSql, connection);

            insertCommand.Parameters.Add(
                "@Email", SqlDbType.NVarChar, 255).Value = email;

            insertCommand.Parameters.Add(
                "@Phone", SqlDbType.NVarChar, 16).Value =
                (object?)user.Phone ?? DBNull.Value;

            insertCommand.Parameters.Add(
                "@PasswordHash", SqlDbType.NVarChar, 255)
                .Value = user.PasswordHash;

            insertCommand.Parameters.Add(
                "@TermsAccepted", SqlDbType.Bit)
                .Value = user.TermsAccepted;

            insertCommand.Parameters.Add(
                "@CreatedAt", SqlDbType.DateTime2)
                .Value = user.CreatedAt;

            insertCommand.Parameters.Add(
                "@IsActive", SqlDbType.Bit)
                .Value = user.IsActive;

            try
            {
                user.UserId = Convert.ToInt32(
                    await insertCommand.ExecuteScalarAsync());
            }
            catch (SqlException ex)
                when (ex.Number == 2601 || ex.Number == 2627)
            {
                throw new InvalidOperationException(
                    "Email is already registered.");
            }

            // Consume token only after successful registration.
            _cache.Remove(TokenCacheKey(email));

            return user;
        }
        finally
        {
            gate.Release();
        }
    }

    // LOGIN
    public async Task<User?> LoginAsync(LoginRequest request)
    {
        string email = NormalizeEmail(request.Email);

        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        const string sql = """
            SELECT UserId, Email, Phone, PasswordHash,
                   TermsAccepted, CreatedAt, IsActive
            FROM dbo.Users
            WHERE Email = @Email  AND IsActive = 1;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.Add(
            "@Email", SqlDbType.NVarChar, 255).Value = email;

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var user = new User
        {
            UserId = reader.GetInt32(0),
            Email = reader.GetString(1),
            Phone = reader.IsDBNull(2) ? null : reader.GetString(2),
            PasswordHash = reader.IsDBNull(3)
                ? null : reader.GetString(3),
            TermsAccepted = reader.GetBoolean(4),
            CreatedAt = reader.GetDateTime(5),
            IsActive = reader.GetBoolean(6)
        };

        if (!user.IsActive || user.PasswordHash == null)
            return null;

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
            return null;

        return user;
    }

    // FORGOT PASSWORD - SEND RESET OTP
    
    public async Task ForgotPasswordAsync(string email)
    {
        email = NormalizeEmail(email);

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string sql = """
                SELECT COUNT(*)
                FROM dbo.Users
                WHERE Email = @Email AND IsActive = 1;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.Add(
                "@Email", SqlDbType.NVarChar, 255
            ).Value = email;

            int exists = Convert.ToInt32(
                await command.ExecuteScalarAsync());

            if (exists == 0)
                throw new ArgumentException("Account not found.");

            // Generate 6-digit OTP
            var otp = OtpGenerator.GenerateOtp();

            // Remove previous reset verification
            _cache.Remove(ResetVerificationCacheKey(email));

            // Store hashed OTP for 5 minutes
            _cache.Set(
                ResetOtpCacheKey(email),
                new OtpState
                {
                    Hash = HashOtp(otp),
                    Attempts = 0
                },
                TimeSpan.FromMinutes(5)
            );

            string htmlBody =
                EmailTemplates.ForgotPasswordOtpEmail(otp);

            try
            {
                await _emailService.SendEmailAsync(
                    email,
                    "TradeMate Password Reset OTP",
                    htmlBody
                );
            }
            catch
            {
                _cache.Remove(ResetOtpCacheKey(email));
                throw;
            }
        }
        finally
        {
            gate.Release();
        }
    }

    // VERIFY PASSWORD RESET OTP
    public async Task<string> VerifyResetOtpAsync(
        string email,
        string otp)
    {
        email = NormalizeEmail(email);

        if (string.IsNullOrWhiteSpace(otp) ||
            otp.Length != 6 ||
            otp.Any(c => c < '0' || c > '9'))
        {
            throw new ArgumentException("Invalid OTP.");
        }

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            if (!_cache.TryGetValue<OtpState>(
                ResetOtpCacheKey(email), out var state) ||
                state == null)
            {
                throw new ArgumentException(
                    "Password reset OTP expired or not found. Request a new OTP.");
            }

            state.Attempts++;

            if (state.Attempts > MaxOtpAttempts)
            {
                _cache.Remove(ResetOtpCacheKey(email));

                throw new ArgumentException(
                    "Maximum OTP attempts exceeded. Request a new OTP.");
            }

            var submittedHash = HashOtp(otp);

            if (!HashMatches(state.Hash, submittedHash))
            {
                if (state.Attempts >= MaxOtpAttempts)
                    _cache.Remove(ResetOtpCacheKey(email));

                throw new ArgumentException(
                    "Incorrect OTP. Please try again.");
            }

            // OTP can only be used once.
            _cache.Remove(ResetOtpCacheKey(email));

            var tokenBytes = RandomNumberGenerator.GetBytes(32);

            var verificationToken = Convert.ToBase64String(tokenBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');

            _cache.Set(
                ResetVerificationCacheKey(email),
                new VerificationState
                {
                    Hash = HashToken(verificationToken)
                },
                TimeSpan.FromMinutes(10)
            );

            return verificationToken;
        }
        finally
        {
            gate.Release();
        }
    }
    
    public async Task<string> VerifyPasswordResetOtpAsync(
        string email,
        string otp)
    {
        email = NormalizeEmail(email);

        if (string.IsNullOrWhiteSpace(otp) ||
            otp.Length != 6 ||
            otp.Any(c => c < '0' || c > '9'))
        {
            throw new ArgumentException("Invalid OTP.");
        }

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            if (!_cache.TryGetValue<OtpState>(
                ResetOtpCacheKey(email), out var state) ||
                state == null)
            {
                throw new ArgumentException(
                    "OTP expired. Please request a new OTP.");
            }

            state.Attempts++;

            if (state.Attempts > MaxOtpAttempts)
            {
                _cache.Remove(ResetOtpCacheKey(email));

                throw new ArgumentException(
                    "Maximum attempts exceeded. Request a new OTP.");
            }

            string submittedHash = HashOtp(otp);

            if (!HashMatches(state.Hash, submittedHash))
            {
                if (state.Attempts >= MaxOtpAttempts)
                    _cache.Remove(ResetOtpCacheKey(email));

                throw new ArgumentException(
                    "Incorrect OTP. Please try again.");
            }

            // Consume OTP after successful verification
            _cache.Remove(ResetOtpCacheKey(email));

            // Generate secure random verification token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);

            var verificationToken =
                Convert.ToBase64String(tokenBytes)
                    .TrimEnd('=')
                    .Replace('+', '-')
                    .Replace('/', '_');

            // Store only token hash for 10 minutes
            _cache.Set(
                ResetVerificationCacheKey(email),
                new VerificationState
                {
                    Hash = HashToken(verificationToken)
                },
                TimeSpan.FromMinutes(10)
            );

            return verificationToken;
        }
        finally
        {
            gate.Release();
        }
    }

    // RESET PASSWORD
    
    public async Task ResetPasswordAsync(
        ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new ArgumentException("Passwords do not match.");

        if (request.NewPassword.Length < 8)
            throw new ArgumentException(
                "Password must contain at least 8 characters.");

        string email = NormalizeEmail(request.Email);

        if (string.IsNullOrWhiteSpace(request.VerificationToken))
            throw new ArgumentException(
                "Password verification token is required.");

        var gate = EmailLocks.GetOrAdd(
            email, _ => new SemaphoreSlim(1, 1));

        await gate.WaitAsync();

        try
        {
            if (!_cache.TryGetValue<VerificationState>(
                ResetVerificationCacheKey(email), out var state) ||
                state == null)
            {
                throw new ArgumentException(
                    "Verification expired. Please verify your OTP again.");
            }

            string submittedHash =
                HashToken(request.VerificationToken);

            if (!HashMatches(state.Hash, submittedHash))
                throw new ArgumentException(
                    "Invalid verification token.");

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            var user = new User
            {
                Email = email
            };

            string passwordHash =
                _passwordHasher.HashPassword(
                    user, request.NewPassword);

            const string sql = """
                UPDATE dbo.Users
                SET PasswordHash = @PasswordHash
                WHERE Email = @Email AND IsActive = 1;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.Add(
                "@PasswordHash",
                SqlDbType.NVarChar,
                255
            ).Value = passwordHash;

            command.Parameters.Add(
                "@Email",
                SqlDbType.NVarChar,
                255
            ).Value = email;

            int rows = await command.ExecuteNonQueryAsync();

            if (rows == 0)
                throw new ArgumentException(
                    "Unable to reset password.");

            // Consume verification token after successful update
            _cache.Remove(ResetVerificationCacheKey(email));
        }
        finally
        {
            gate.Release();
        }
    }

}
