using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

using PRN212.AIStudyHub.Application.DTOs.Auth;
using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [Route("api/v1/auth")]
  public class AuthController(IAuthService authService, IMemoryCache memoryCache) : BaseApiController
  {
    /// <summary>
    /// Đăng ký tài khoản mới (Gửi OTP qua email)
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
          [FromBody] RegisterRequest request,
          CancellationToken cancellationToken)
    {
      var message = await authService.Register(request, cancellationToken);
      return Ok(ApiResponse.SuccessResponse(message));
    }

    /// <summary>
    /// Đăng nhập tài khoản bằng Email & Mật khẩu
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
          [FromBody] LoginRequest request,
          CancellationToken cancellationToken)
    {
      var result = await authService.Login(request, cancellationToken);
      return Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Login successfully."));
    }

    /// <summary>
    /// Xác thực mã OTP để hoàn tất đăng ký tài khoản
    /// </summary>
    [HttpPost("verify-otp")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyOtp(
          [FromBody] VerifyOtpRequest request,
          CancellationToken cancellationToken)
    {
      var message = await authService.VerifyOtp(request, cancellationToken);
      return Ok(ApiResponse.SuccessResponse(message));
    }

    /// <summary>
    /// Đăng nhập bằng Google (hỗ trợ cả Google Access Token ya29 và Google ID Token JWT)
    /// </summary>
    [HttpPost("google-login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status202Accepted)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GoogleLogin(
          [FromBody] GoogleLoginRequest request,
          CancellationToken cancellationToken)
    {
      var result = await authService.GoogleLogin(request, cancellationToken);
      return result.IsNewUser
        ? StatusCode(StatusCodes.Status202Accepted,
            ApiResponse<object>.SuccessResponse(
                new
                {
                  isNewUser = true,
                  temporaryToken = result.TemporaryToken
                },
                result.Message ?? "Please choose your role to complete registration."))
        : (IActionResult)Ok(ApiResponse<AuthResponse>.SuccessResponse(result.AuthResponse, "Google login successfully."));
    }

    /// <summary>
    /// Hoàn tất đăng ký Google bằng cách chọn vai trò (Student hoặc Lecturer)
    /// </summary>
    [HttpPost("complete-google-registration")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CompleteGoogleRegistration(
          [FromBody] CompleteGoogleRegistrationRequest request,
          CancellationToken cancellationToken)
    {
      var authHeader = Request.Headers.Authorization.ToString();
      if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        throw new UnauthorizedException("Missing or invalid Authorization header.");
      }

      var tempToken = authHeader["Bearer ".Length..].Trim();
      var result = await authService.CompleteGoogleRegistration(request, tempToken, cancellationToken);

      return Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Completed Google registration successfully."));
    }

    /// <summary>
    /// Đăng xuất và đưa token vào danh sách đen (Blacklist)
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public IActionResult Logout()
    {
      var authHeader = Request.Headers.Authorization.ToString();
      if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        throw new BadRequestException("Invalid token format.");
      }

      var authToken = authHeader["Bearer ".Length..].Trim();
      var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(1));
      _ = memoryCache.Set($"Blacklist_{authToken}", true, cacheOptions);

      return Ok(ApiResponse.SuccessResponse("Logout successfully."));
    }

    /// <summary>
    /// Lấy thông tin hồ sơ của tài khoản hiện tại
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
      var result = await authService.GetCurrentUser(CurrentUserId, cancellationToken);
      return Ok(ApiResponse<UserDto>.SuccessResponse(result, "Fetched user profile successfully."));
    }

    /// <summary>
    /// Yêu cầu gửi mã OTP khôi phục mật khẩu qua Email
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ForgotPassword(
          [FromBody] ForgotPasswordRequestDto request,
          CancellationToken cancellationToken)
    {
      var message = await authService.ForgotPassword(request, cancellationToken);
      return Ok(ApiResponse.SuccessResponse(message));
    }

    /// <summary>
    /// Đặt lại mật khẩu mới bằng mã OTP
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(
          [FromBody] ResetPasswordDto request,
          CancellationToken cancellationToken)
    {
      var message = await authService.ResetPassword(request, cancellationToken);
      return Ok(ApiResponse.SuccessResponse(message));
    }
  }
}
