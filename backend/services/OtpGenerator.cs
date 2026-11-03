
using System.Security.Cryptography;

namespace backend.services;

public static class OtpGenerator
{
    public static string GenerateOtp()
    {
        int otp = RandomNumberGenerator.GetInt32(100000, 1000000);

        return otp.ToString();
    }
}
