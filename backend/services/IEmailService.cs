// what email functionality must be available, but not how to send the email.

namespace backend.services;

public interface IEmailService
{
    Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody
    );
}
