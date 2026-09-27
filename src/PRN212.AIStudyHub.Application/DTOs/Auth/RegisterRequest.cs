namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public record RegisterRequest(string Email, string Password, string ConfirmPassword, string FirstName, string LastName, string Role);
}
