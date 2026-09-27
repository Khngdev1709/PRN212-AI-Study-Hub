using PRN212.AIStudyHub.Application.Interfaces.Security;

namespace PRN212.AIStudyHub.Infrastructure.Security
{
  public class PasswordHasher : IPasswordHasher
  {
    private const int WorkFactor = 12;

    public string HashPassword(string password)
    {
      return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string providedPassword, string hashedPassword)
    {
      return BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);
    }
  }
}
