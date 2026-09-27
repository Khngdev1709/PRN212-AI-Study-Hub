using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using PRN212.AIStudyHub.Application.Interfaces.Security;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Infrastructure.Security
{
  public class JwtTokenGenerator(IOptions<JwtSettings> jwtOptions) : IJwtTokenGenerator
  {
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public string GenerateToken(AppUser user)
    {
      var secretKey = _jwtSettings.Secret;
      if (string.IsNullOrEmpty(secretKey))
      {
        throw new InvalidOperationException("JWT secret key is not configured.");
      }

      JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
      var key = System.Text.Encoding.UTF8.GetBytes(secretKey);

      List<Claim> claims = new List<Claim>
      {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.GivenName, $"{user.LastName} {user.FirstName}"),
        new(ClaimTypes.Role, user.Role)
      };

      SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Issuer = _jwtSettings.Issuer,
        Audience = _jwtSettings.Audience,
        Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(key),
          SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    public string GenerateTemporaryToken(string email, string firstName, string lastName)
    {
      var secretKey = _jwtSettings.Secret;
      if (string.IsNullOrEmpty(secretKey))
      {
        throw new InvalidOperationException("JWT secret key is not configured.");
      }

      JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
      var key = System.Text.Encoding.UTF8.GetBytes(secretKey);

      List<Claim> claims = new List<Claim>
      {
        new(ClaimTypes.Email, email),
        new(ClaimTypes.GivenName, firstName),
        new(ClaimTypes.Surname, lastName),
        new("Purpose", "GoogleOnboarding")
      };

      SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Issuer = _jwtSettings.Issuer,
        Audience = _jwtSettings.Audience,
        Expires = DateTime.UtcNow.AddMinutes(5), // 5 minutes TTL
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(key),
          SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    public ClaimsPrincipal? ValidateTemporaryToken(string token)
    {
      var secretKey = _jwtSettings.Secret;
      JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
      var key = System.Text.Encoding.UTF8.GetBytes(secretKey!);

      try
      {
        var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = new SymmetricSecurityKey(key),
          ValidateIssuer = true,
          ValidIssuer = _jwtSettings.Issuer,
          ValidateAudience = true,
          ValidAudience = _jwtSettings.Audience,
          ValidateLifetime = true,
          ClockSkew = TimeSpan.Zero
        }, out SecurityToken validatedToken);

        // Check Purpose claim
        return !principal.HasClaim(c => c.Type == "Purpose" && c.Value == "GoogleOnboarding") ? null : principal;
      }
      catch
      {
        return null;
      }
    }
  }
}
