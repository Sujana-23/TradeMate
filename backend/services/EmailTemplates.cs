
namespace backend.services;

public static class EmailTemplates
{
    // REGISTRATION OTP EMAIL
    public static string OtpEmail(string otp)
    {
        return GenerateOtpEmail(
            "TradeMate Email Verification",
            "Thank you for registering with TradeMate. Please use the OTP below to verify your email.",
            otp
        );
    }

    // FORGOT PASSWORD OTP EMAIL
    public static string ForgotPasswordOtpEmail(string otp)
    {
        return GenerateOtpEmail(
            "TradeMate Password Reset",
            "We received a request to reset your TradeMate account password. Use the OTP below to continue.",
            otp
        );
    }

    // COMMON OTP EMAIL TEMPLATE
    private static string GenerateOtpEmail(
        string heading,
        string message,
        string otp)
    {
        return $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;
                     background-color: #f4f4f4;
                     padding: 30px;">

            <div style="max-width: 500px;
                        margin: auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;">

                <h2 style="color: #2563eb;">
                    {heading}
                </h2>

                <p>Hello!</p>

                <p>{message}</p>

                <h1 style="letter-spacing: 8px;
                           color: #2563eb;
                           text-align: center;">
                    {System.Net.WebUtility.HtmlEncode(otp)}
                </h1>

                <p>
                    This OTP is valid for <b>5 minutes</b>.
                </p>

                <p>
                    Do not share this OTP with anyone.
                </p>

                <hr />

                <p style="color: gray;">
                    Regards,<br />
                    TradeMate Team
                </p>

            </div>

        </body>
        </html>
        """;
    }

    // PASSWORD RESET EMAIL WITH FRONTEND RESET LINK
    public static string PasswordResetEmail(
        string email,
        string token)
    {
        string frontendUrl =
            "http://localhost:5173/reset-password";

        string resetLink =
            $"{frontendUrl}?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        string safeResetLink =
            System.Net.WebUtility.HtmlEncode(resetLink);

        return $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;
                     background-color: #f4f4f4;
                     padding: 30px;">

            <div style="max-width: 500px;
                        margin: auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;">

                <h2 style="color: #2563eb;">
                    TradeMate Password Reset
                </h2>

                <p>Hello!</p>

                <p>
                    We received a request to reset your TradeMate password.
                </p>

                <p>
                    Click the button below to reset your password.
                </p>

                <p style="text-align: center; margin: 30px 0;">

                    <a href="{safeResetLink}"
                       style="background: #2563eb;
                              color: white;
                              padding: 13px 25px;
                              text-decoration: none;
                              border-radius: 6px;
                              display: inline-block;">

                        Reset Password

                    </a>

                </p>

                <p>
                    This reset link is valid for <b>10 minutes</b>.
                </p>

                <p>
                    If you did not request a password reset,
                    please ignore this email.
                </p>

                <hr />

                <p style="color: gray;">
                    Regards,<br />
                    TradeMate Team
                </p>

            </div>

        </body>
        </html>
        """;
    }
}
