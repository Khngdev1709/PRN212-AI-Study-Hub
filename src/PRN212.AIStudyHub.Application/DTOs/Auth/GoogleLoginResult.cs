namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public class GoogleLoginResult
  {
    public bool IsNewUser { get; set; }
    public AuthResponse? AuthResponse { get; set; }
    public string? TemporaryToken { get; set; }
    public string? Message { get; set; }
  }
}
