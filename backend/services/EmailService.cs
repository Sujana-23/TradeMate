// sending emails from your TradeMate application using an SMTP server.

using backend.models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace backend.services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody)
    {
        var message = new MimeMessage();

        message.From.Add(
            new MailboxAddress("TradeMate", _settings.Email)
        );

        message.To.Add(
            MailboxAddress.Parse(toEmail)
        );

        message.Subject = subject;

        message.Body = new BodyBuilder
        {
            HtmlBody = htmlBody
        }.ToMessageBody();

        using var client = new SmtpClient();

        await client.ConnectAsync(
            _settings.SmtpHost,
            _settings.SmtpPort,
            SecureSocketOptions.StartTls
        );

        await client.AuthenticateAsync(
            _settings.Email,
            _settings.AppPassword
        );

        await client.SendAsync(message);

        await client.DisconnectAsync(true);
    }
}
