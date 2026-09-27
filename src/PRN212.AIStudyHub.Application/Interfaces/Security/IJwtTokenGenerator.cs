using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Application.Interfaces.Security
{
  public interface IJwtTokenGenerator
  {
    string GenerateToken(AppUser user);
    string GenerateTemporaryToken(string email, string firstName, string lastName);
    System.Security.Claims.ClaimsPrincipal? ValidateTemporaryToken(string token);
  }
}
