
using System.Data;
using System.Text.RegularExpressions;
using backend.DTOs;
using backend.models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

namespace backend.services;

public class ProfileService
{
    private readonly string _connectionString;

    private readonly PasswordHasher<User> _passwordHasher = new();

    public ProfileService(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new Exception("TradeMate connection string missing.");
    }

    // GET PROFILE
    public async Task<ProfileResponseDto?> GetProfileAsync(int userId)
    {
        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        const string sql = """
            SELECT Email, Phone, CreatedAt, TermsAccepted
            FROM dbo.Users
            WHERE UserId = @UserId
              AND IsActive = 1;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.Add("@UserId", SqlDbType.Int).Value = userId;

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        return new ProfileResponseDto
        {
            Email = reader.GetString(0),
            Phone = reader.IsDBNull(1) ? null : reader.GetString(1),
            CreatedAt = reader.GetDateTime(2),
            TermsAccepted = reader.GetBoolean(3)
        };
    }

    // UPDATE PROFILE
    public async Task<bool> UpdateProfileAsync(
        int userId,
        UpdateProfileDto request)
    {
        string email = request.Email.Trim().ToLowerInvariant();

        if (!Regex.IsMatch(
            email,
            @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
        {
            throw new ArgumentException(
                "Please enter a valid email address.");
        }

        string? phone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();

        if (phone != null)
        {
            string digits = Regex.Replace(phone, @"\D", "");

            if (digits.Length < 7 || digits.Length > 15)
            {
                throw new ArgumentException(
                    "Please enter a valid phone number.");
            }

            phone = digits;
        }

        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        const string sql = """
            UPDATE dbo.Users
            SET Email = @Email,
                Phone = @Phone
            WHERE UserId = @UserId
              AND IsActive = 1
              AND NOT EXISTS (
                  SELECT 1
                  FROM dbo.Users
                  WHERE Email = @Email
                    AND UserId <> @UserId
              );
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.Add("@Email", SqlDbType.NVarChar, 255)
            .Value = email;

        command.Parameters.Add("@Phone", SqlDbType.NVarChar, 16)
            .Value = (object?)phone ?? DBNull.Value;

        command.Parameters.Add("@UserId", SqlDbType.Int)
            .Value = userId;

        try
        {
            int rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
                return true;

            // Distinguish duplicate email from missing/inactive user.
            const string checkSql = """
                SELECT COUNT(*)
                FROM dbo.Users
                WHERE Email = @Email
                  AND UserId <> @UserId;
                """;

            await using var checkCommand =
                new SqlCommand(checkSql, connection);

            checkCommand.Parameters.Add("@Email", SqlDbType.NVarChar, 255)
                .Value = email;

            checkCommand.Parameters.Add("@UserId", SqlDbType.Int)
                .Value = userId;

            int duplicateCount =
                (int)await checkCommand.ExecuteScalarAsync();

            if (duplicateCount > 0)
                throw new InvalidOperationException(
                    "This email address is already registered.");

            return false;
        }
        catch (SqlException ex)
            when (ex.Number == 2601 || ex.Number == 2627)
        {
            throw new InvalidOperationException(
                "This email address is already registered.");
        }
    }

    // CHANGE PASSWORD
    public async Task<bool> ChangePasswordAsync(
        int userId,
        ChangePasswordDto request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword) ||
            string.IsNullOrWhiteSpace(request.ConfirmPassword))
        {
            throw new ArgumentException(
                "Please fill in all password fields.");
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new ArgumentException(
                "New passwords do not match.");
        }

        string newPassword = request.NewPassword;

        bool strongPassword =
            newPassword.Length >= 8 &&
            Regex.IsMatch(newPassword, "[A-Z]") &&
            Regex.IsMatch(newPassword, "[a-z]") &&
            Regex.IsMatch(newPassword, "[0-9]") &&
            Regex.IsMatch(newPassword, "[^A-Za-z0-9]");

        if (!strongPassword)
        {
            throw new ArgumentException(
                "Password must contain at least 8 characters, " +
                "one uppercase letter, one lowercase letter, " +
                "one number and one special character.");
        }

        if (request.CurrentPassword == newPassword)
        {
            throw new ArgumentException(
                "New password must be different from current password.");
        }

        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        const string selectSql = """
            SELECT PasswordHash
            FROM dbo.Users
            WHERE UserId = @UserId
              AND IsActive = 1;
            """;

        await using var selectCommand =
            new SqlCommand(selectSql, connection);

        selectCommand.Parameters.Add("@UserId", SqlDbType.Int)
            .Value = userId;

        var storedHash = await selectCommand.ExecuteScalarAsync();

        if (storedHash == null || storedHash == DBNull.Value)
            return false;

        string currentHash = (string)storedHash;

        var user = new User
        {
            UserId = userId,
            PasswordHash = currentHash
        };

        var verification = _passwordHasher.VerifyHashedPassword(
            user,
            currentHash,
            request.CurrentPassword
        );

        if (verification == PasswordVerificationResult.Failed)
        {
            throw new ArgumentException(
                "Current password is incorrect.");
        }

        string newHash = _passwordHasher.HashPassword(
            user,
            newPassword
        );

        const string updateSql = """
            UPDATE dbo.Users
            SET PasswordHash = @PasswordHash
            WHERE UserId = @UserId
              AND PasswordHash = @OldPasswordHash
              AND IsActive = 1;
            """;

        await using var updateCommand =
            new SqlCommand(updateSql, connection);

        updateCommand.Parameters.Add(
            "@PasswordHash", SqlDbType.NVarChar, 255)
            .Value = newHash;

        updateCommand.Parameters.Add("@UserId", SqlDbType.Int)
            .Value = userId;

        updateCommand.Parameters.Add(
            "@OldPasswordHash", SqlDbType.NVarChar, 255)
            .Value = currentHash;

        return await updateCommand.ExecuteNonQueryAsync() > 0;
    }
}
