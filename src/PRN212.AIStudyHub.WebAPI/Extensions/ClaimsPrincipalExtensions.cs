using System.Security.Claims;

using PRN212.AIStudyHub.Application.Exceptions;

namespace PRN212.AIStudyHub.WebAPI.Extensions
{
  public static class ClaimsPrincipalExtensions
  {
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
      var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      return string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId)
        ? throw new UnauthorizedException("User is not authenticated or token payload is invalid.")
        : userId;
    }

    public static string? GetEmail(this ClaimsPrincipal principal)
    {
      return principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static string? GetRole(this ClaimsPrincipal principal)
    {
      return principal.FindFirst(ClaimTypes.Role)?.Value;
    }
  }
}
