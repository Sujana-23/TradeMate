
namespace backend.services;

public static class EmailTemplates
{
    public static string OtpEmail(string otp)
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
                    TradeMate Email Verification
                </h2>

                <p>Hello!</p>

                <p>
                    Thank you for registering with TradeMate.
                    Please use the OTP below to verify your email.
                </p>

                <h1 style="letter-spacing: 8px;
                           color: #2563eb;
                           text-align: center;">
                    {otp}
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
}
