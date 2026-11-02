
using System.Data;
using backend.models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

namespace backend.services;

public class AuthService
{
    private readonly string _connectionString;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new Exception("TradeMate connection string missing.");
    }

    // REGISTER
    public async Task<User> RegisterAsync(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            throw new ArgumentException("Passwords do not match.");

        if (!request.TermsAccepted)
            throw new ArgumentException("Please accept the Terms and Conditions.");

        string email = request.Email.Trim().ToLowerInvariant();

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        const string checkSql = """
            SELECT COUNT(*)
            FROM dbo.Users
            WHERE Email = @Email;
            """;

        await using var checkCommand = new SqlCommand(checkSql, connection);
        checkCommand.Parameters.Add("@Email", SqlDbType.NVarChar, 255).Value = email;

        int exists = (int)await checkCommand.ExecuteScalarAsync();

        if (exists > 0)
            throw new InvalidOperationException("Email is already registered.");

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
            user, request.Password
        );

        const string insertSql = """
            INSERT INTO dbo.Users
                (Email, Phone, PasswordHash, TermsAccepted, CreatedAt, IsActive)
            OUTPUT INSERTED.UserId
            VALUES
                (@Email, @Phone, @PasswordHash, @TermsAccepted, @CreatedAt, @IsActive);
            """;

        await using var insertCommand = new SqlCommand(insertSql, connection);

        insertCommand.Parameters.Add("@Email", SqlDbType.NVarChar, 255).Value = email;

        insertCommand.Parameters.Add("@Phone", SqlDbType.NVarChar, 16).Value =
            (object?)user.Phone ?? DBNull.Value;

        insertCommand.Parameters.Add("@PasswordHash", SqlDbType.NVarChar, 255)
            .Value = user.PasswordHash;

        insertCommand.Parameters.Add("@TermsAccepted", SqlDbType.Bit)
            .Value = user.TermsAccepted;

        insertCommand.Parameters.Add("@CreatedAt", SqlDbType.DateTime2)
            .Value = user.CreatedAt;

        insertCommand.Parameters.Add("@IsActive", SqlDbType.Bit)
            .Value = user.IsActive;

        try
        {
            user.UserId = (int)await insertCommand.ExecuteScalarAsync();
        }
        catch (SqlException ex) when (ex.Number == 2601 || ex.Number == 2627)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        return user;
    }

    // LOGIN
    public async Task<User?> LoginAsync(LoginRequest request)
    {
        string email = request.Email.Trim().ToLowerInvariant();

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        const string sql = """
            SELECT UserId, Email, Phone, PasswordHash,
                   TermsAccepted, CreatedAt, IsActive
            FROM dbo.Users
            WHERE Email = @Email;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.Add("@Email", SqlDbType.NVarChar, 255).Value = email;

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var user = new User
        {
            UserId = reader.GetInt32(0),
            Email = reader.GetString(1),
            Phone = reader.IsDBNull(2) ? null : reader.GetString(2),
            PasswordHash = reader.IsDBNull(3) ? null : reader.GetString(3),
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
}
