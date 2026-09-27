namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public record AuthResponse(string AccessToken, string RefreshToken, string TokenType, int ExpiresIn, UserDto User);
}
