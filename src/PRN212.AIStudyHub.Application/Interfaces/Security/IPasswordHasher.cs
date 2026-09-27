namespace PRN212.AIStudyHub.Application.Interfaces.Security
{
  public interface IPasswordHasher
  {
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
  }
}
