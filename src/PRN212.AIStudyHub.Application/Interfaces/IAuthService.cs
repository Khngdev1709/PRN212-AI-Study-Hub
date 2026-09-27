using PRN212.AIStudyHub.Application.DTOs.Auth;

namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface IAuthService
  {
    Task<AuthResponse> Login(
      LoginRequest request,
      CancellationToken cancellationToken = default);

    Task<GoogleLoginResult> GoogleLogin(
      GoogleLoginRequest request,
      CancellationToken cancellationToken = default);

    Task<AuthResponse> CompleteGoogleRegistration(
      CompleteGoogleRegistrationRequest request,
      string tempToken,
      CancellationToken cancellationToken = default);

    Task<string> Register(
      RegisterRequest request,
      CancellationToken cancellationToken = default);

    Task<string> VerifyOtp(
      VerifyOtpRequest request,
      CancellationToken cancellationToken = default);

    Task<UserDto> GetCurrentUser(
      Guid userId,
      CancellationToken cancellationToken = default);

    Task<string> ForgotPassword(
      ForgotPasswordRequestDto request,
      CancellationToken cancellationToken = default);

    Task<string> ResetPassword(
      ResetPasswordDto request,
      CancellationToken cancellationToken = default);
  }
}
