namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface IEmailService
  {
    Task SendEmailAsync(
      string toEmail,
      string subject,
      string body,
      CancellationToken cancellationToken = default);
  }
}
