
using System.Security.Cryptography;
using System.Text;
using backend.models;
using Microsoft.Extensions.Caching.Memory;

namespace backend.services;

public class EmailVerificationService
{
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public EmailVerificationService(
        IMemoryCache cache,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _cache = cache;
        _emailService = emailService;
        _configuration = configuration;
    }

    // Hash OTP using HMAC-SHA256
    private string HashOtp(string otp)
    {
        string secret = _configuration["EmailSettings:OtpSecret"]
            ?? throw new InvalidOperationException(
                "OTP secret is missing from User Secrets."
            );

        using var hmac = new HMACSHA256(
            Encoding.UTF8.GetBytes(secret)
        );

        byte[] hash = hmac.ComputeHash(
            Encoding.UTF8.GetBytes(otp)
        );

        return Convert.ToHexString(hash);
    }
}
