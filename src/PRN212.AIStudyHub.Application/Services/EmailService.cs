using System.Net;
using System.Net.Mail;

using Microsoft.Extensions.Configuration;

using PRN212.AIStudyHub.Application.Interfaces;

namespace PRN212.AIStudyHub.Application.Services
{
  public class EmailService(IConfiguration config) : IEmailService
  {
    public async Task SendEmailAsync(
          string toEmail,
          string subject,
          string body,
          CancellationToken cancellationToken = default)
    {
      var smtpServer = config["EmailSettings:SmtpServer"];
      var port = int.Parse(config["EmailSettings:SmtpPort"] ?? "587");
      var senderEmail = config["EmailSettings:SenderEmail"];
      var password = config["EmailSettings:SenderPassword"]?.Trim();
      var senderName = config["EmailSettings:SenderName"] ?? "AI Study Hub";

      if (string.IsNullOrEmpty(smtpServer)
          || string.IsNullOrEmpty(senderEmail)
          || string.IsNullOrEmpty(password))
      {
        throw new InvalidOperationException("Email settings are not configured properly in appsettings.json.");
      }

      MailMessage message = new MailMessage
      {
        From = new MailAddress(senderEmail, senderName),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
      };
      message.To.Add(new MailAddress(toEmail));

      using SmtpClient smtpClient = new SmtpClient(smtpServer, port)
      {
        Credentials = new NetworkCredential(senderEmail, password),
        EnableSsl = true
      };

      await smtpClient.SendMailAsync(message, cancellationToken);
    }
  }
}
