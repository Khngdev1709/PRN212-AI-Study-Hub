namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public class GoogleLoginRequest
  {
    public string? AccessToken { get; set; }

    public string GetTokenChecked()
    {
      return !string.IsNullOrEmpty(AccessToken) ? AccessToken : string.Empty;
    }
  }
}
