// This is a C# model class called EmailSettings.
//  It is used to store and organize the configuration required to send emails from your 
//  ASP.NET Core application using Gmail.

namespace backend.models;

public class EmailSettings
{
    public string Email { get; set; } = "";

    public string AppPassword { get; set; } = "";

    public string SmtpHost { get; set; } = "smtp.gmail.com";

    public int SmtpPort { get; set; } = 587;
}
