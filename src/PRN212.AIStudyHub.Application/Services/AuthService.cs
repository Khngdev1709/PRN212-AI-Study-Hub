using System.Security.Cryptography;
using System.Text.Json;

using Google.Apis.Auth;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

using PRN212.AIStudyHub.Application.DTOs.Auth;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Application.Interfaces.Security;
using PRN212.AIStudyHub.Application.Utils;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Application.Services
{
  public class AuthService(
      IAppDbContext context,
      IPasswordHasher passwordHasher,
      IJwtTokenGenerator jwtTokenGenerator,
      IMemoryCache cache,
      IEmailService emailService,
      IConfiguration config) : IAuthService
  {
    public async Task<string> Register(
          RegisterRequest request,
          CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Email)
          || string.IsNullOrWhiteSpace(request.Password)
          || string.IsNullOrWhiteSpace(request.ConfirmPassword)
          || string.IsNullOrWhiteSpace(request.FirstName)
          || string.IsNullOrWhiteSpace(request.LastName))
      {
        throw new BadRequestException("All fields are required.");
      }

      if (!ValidationUtils.IsValidEmail(request.Email))
      {
        throw new BadRequestException("Invalid email format.");
      }

      if (!ValidationUtils.IsValidName(request.FirstName))
      {
        throw new BadRequestException("Invalid first name format.");
      }

      if (!ValidationUtils.IsValidName(request.LastName))
      {
        throw new BadRequestException("Invalid last name format.");
      }

      var existingEmail = await context.AppUsers
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

      if (existingEmail is not null)
      {
        throw new ConflictException("Email already exists.");
      }

      if (request.Password != request.ConfirmPassword)
      {
        throw new BadRequestException("Passwords do not match.");
      }

      if (request.Password.Length < 6)
      {
        throw new BadRequestException("Password must be at least 6 characters long.");
      }

      var otp = new Random().Next(100000, 999999).ToString();
      var cacheKey = $"OTP_{request.Email}";
      var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
      _ = cache.Set(cacheKey, new OtpCacheEntry(request, otp), cacheEntryOptions);

      var subject = "Xác nhận đăng ký tài khoản AI Study Hub";
      var body = $"<h3>Chào {request.FirstName},</h3><p>Mã OTP xác nhận đăng ký tài khoản của bạn là: <strong>{otp}</strong></p><p>Mã này sẽ hết hạn sau 5 phút.</p>";
      await emailService.SendEmailAsync(request.Email, subject, body, cancellationToken);

      return "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).";
    }

    public async Task<AuthResponse> Login(
          LoginRequest request,
          CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
      {
        throw new BadRequestException("Email and password are required.");
      }

      if (!ValidationUtils.IsValidEmail(request.Email))
      {
        throw new BadRequestException("Invalid email format.");
      }

      var user = await context.AppUsers
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

      if (user is null || !passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
      {
        throw new UnauthorizedException("Invalid credentials.");
      }

      return !user.IsActive
        ? throw new UnauthorizedException("User account is inactive.")
        : await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<string> VerifyOtp(
          VerifyOtpRequest request,
          CancellationToken cancellationToken = default)
    {
      var cacheKey = $"OTP_{request.Email}";

      if (!cache.TryGetValue(cacheKey, out OtpCacheEntry? cachedEntry) || cachedEntry is null)
      {
        throw new BadRequestException("OTP code has expired or was not requested.");
      }

      if (cachedEntry.Otp != request.Otp)
      {
        throw new BadRequestException("OTP code is incorrect.");
      }

      var registerRequest = cachedEntry.Request;

      var existingEmail = await context.AppUsers
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.Email == registerRequest.Email, cancellationToken);

      if (existingEmail is not null)
      {
        throw new ConflictException("Email already exists.");
      }

      AppUser newUser = new AppUser
      {
        Email = registerRequest.Email,
        PasswordHash = passwordHasher.HashPassword(registerRequest.Password),
        FirstName = registerRequest.FirstName,
        LastName = registerRequest.LastName,
        Role = registerRequest.Role ?? "Student",
        IsActive = true,
      };

      _ = context.AppUsers.Add(newUser);
      _ = await context.SaveChangesAsync(cancellationToken);

      cache.Remove(cacheKey);

      return "Xác nhận OTP thành công! Tài khoản của bạn đã được tạo, vui lòng đăng nhập.";
    }

    public async Task<UserDto> GetCurrentUser(Guid userId, CancellationToken cancellationToken = default)
    {
      var user = await context.AppUsers
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken) ?? throw new NotFoundException($"User with ID '{userId}' was not found.");
      return new UserDto(
          user.Id,
          user.Email,
          user.FirstName,
          user.LastName,
          user.Role,
          user.IsActive,
          user.CreatedAt,
          user.UpdatedAt);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(
          AppUser user,
          CancellationToken cancellationToken)
    {
      string accessToken = jwtTokenGenerator.GenerateToken(user);
      string refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

      RefreshToken refreshTokenEntity = new RefreshToken
      {
        UserId = user.Id,
        Token = refreshToken,
        ExpiresAt = DateTime.UtcNow.AddDays(7),
        IsRevoked = false
      };

      _ = context.RefreshTokens.Add(refreshTokenEntity);
      _ = await context.SaveChangesAsync(cancellationToken);

      UserDto userDto = new UserDto(
          user.Id,
          user.Email,
          user.FirstName,
          user.LastName,
          user.Role,
          user.IsActive,
          user.CreatedAt,
          user.UpdatedAt);

      return new AuthResponse(accessToken, refreshToken, "Bearer", 3600, userDto);
    }

    public async Task<GoogleLoginResult> GoogleLogin(
          GoogleLoginRequest req,
          CancellationToken cancellationToken = default)
    {
      var accessToken = req.GetTokenChecked();

      if (string.IsNullOrEmpty(accessToken))
      {
        throw new BadRequestException("Google token is required.");
      }

      string userEmail = "";
      string userName = "";
      string firstName = "";
      string lastName = "";

      if (accessToken.StartsWith("ya29"))
      {
        using HttpClient httpClient = new HttpClient();
        var response = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={accessToken}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
          throw new UnauthorizedException("Invalid Google Access Token.");
        }
        var jsonResponse = await response.Content.ReadAsStringAsync(cancellationToken);
        using JsonDocument docs = System.Text.Json.JsonDocument.Parse(jsonResponse);
        var root = docs.RootElement;

        userEmail = root.TryGetProperty("email", out var emailEl) ? emailEl.GetString() ?? "" : "";
        userName = root.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "" : "";
        firstName = root.TryGetProperty("given_name", out var givenNameEl) ? givenNameEl.GetString() ?? userName : userName;
        lastName = root.TryGetProperty("family_name", out var familyNameEl) ? familyNameEl.GetString() ?? "" : "";
      }
      else
      {
        var clientId = config["Google:ClientId"];
        GoogleJsonWebSignature.ValidationSettings settings = new GoogleJsonWebSignature.ValidationSettings
        {
          Audience = [clientId ?? string.Empty]
        };

        try
        {
          var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken, settings);
          userEmail = payload.Email;
          userName = payload.Name;
          firstName = payload.GivenName ?? userName;
          lastName = payload.FamilyName ?? "";
        }
        catch (Exception ex)
        {
          throw new UnauthorizedException($"Invalid Google ID Token: {ex.Message}");
        }
      }

      var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == userEmail, cancellationToken);

      if (userInDb != null)
      {
        return new GoogleLoginResult
        {
          IsNewUser = false,
          AuthResponse = await GenerateAuthResponseAsync(userInDb, cancellationToken)
        };
      }

      var tempToken = jwtTokenGenerator.GenerateTemporaryToken(userEmail, firstName, lastName);
      return new GoogleLoginResult
      {
        IsNewUser = true,
        TemporaryToken = tempToken,
        Message = "Please choose your role to complete registration."
      };
    }

    public async Task<AuthResponse> CompleteGoogleRegistration(
          CompleteGoogleRegistrationRequest request,
          string tempToken,
          CancellationToken cancellationToken = default)
    {
      var principal = jwtTokenGenerator.ValidateTemporaryToken(tempToken) ?? throw new UnauthorizedException("Temporary token is invalid or expired.");
      var email = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
      var firstName = principal.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value ?? "";
      var lastName = principal.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value ?? "";

      if (string.IsNullOrEmpty(email))
      {
        throw new BadRequestException("Invalid token payload: Email claim is missing.");
      }

      if (request.Role is not "Student" and not "Lecturer")
      {
        throw new BadRequestException("Invalid role. Role must be 'Student' or 'Lecturer'.");
      }

      var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
      if (userInDb != null)
      {
        return await GenerateAuthResponseAsync(userInDb, cancellationToken);
      }

      string hashedDummyPassword = passwordHasher.HashPassword(Guid.NewGuid().ToString());

      AppUser newUser = new AppUser
      {
        Email = email,
        FirstName = firstName,
        LastName = lastName,
        PasswordHash = hashedDummyPassword,
        Role = request.Role,
        IsActive = true
      };

      _ = context.AppUsers.Add(newUser);
      _ = await context.SaveChangesAsync(cancellationToken);

      return await GenerateAuthResponseAsync(newUser, cancellationToken);
    }

    public async Task<string> ForgotPassword(
          ForgotPasswordRequestDto request,
          CancellationToken cancellationToken = default)
    {
      var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == request.email, cancellationToken) ?? throw new NotFoundException("Account with this email does not exist.");
      string otp = new Random().Next(100000, 999999).ToString();
      var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
      _ = cache.Set($"OTP_{request.email}", otp, cacheOptions);

      if (!string.IsNullOrEmpty(userInDb.Email) && ValidationUtils.IsValidEmail(userInDb.Email))
      {
        try
        {
          string subject = "AI Study Hub - Reset Password OTP Verification";
          string body = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;'>
                            <h2 style='color: #2563eb; text-align: center;'>AI Study Hub Verification Code</h2>
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Please use the verification code below to proceed:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <span style='font-size: 28px; font-weight: bold; letter-spacing: 4px; background-color: #f3f4f6; padding: 10px 24px; border-radius: 6px; border: 1px solid #e5e7eb;'>{otp}</span>
                            </div>
                            <p>This code is only valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                            <p style='font-size: 12px; color: #666; text-align: center;'>This is an automated message, please do not reply directly to this email.</p>
                        </div>";
          await emailService.SendEmailAsync(userInDb.Email, subject, body, cancellationToken);
        }
        catch (Exception ex)
        {
          Console.WriteLine($"[EMAIL_ERROR] Failed to send email to {userInDb.Email}: {ex.Message}");
        }
      }
      return "Vui lòng nhập mã OTP (đã gửi qua mail) để thay đổi mật khẩu";
    }

    public async Task<string> ResetPassword(
          ResetPasswordDto request,
          CancellationToken cancellationToken = default)
    {
      if (!cache.TryGetValue($"OTP_{request.email}", out string? savedOtp))
      {
        throw new BadRequestException("OTP has expired (over 5 minutes) or has not been requested.");
      }

      if (savedOtp != request.otp)
      {
        throw new BadRequestException("Invalid OTP code.");
      }

      var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == request.email, cancellationToken) ?? throw new NotFoundException("Account does not exist.");
      userInDb.PasswordHash = passwordHasher.HashPassword(request.newPassword);
      _ = await context.SaveChangesAsync(cancellationToken);
      cache.Remove($"OTP_{request.email}");
      return "Mật khẩu đã được cập nhật thành công";
    }
  }
}
