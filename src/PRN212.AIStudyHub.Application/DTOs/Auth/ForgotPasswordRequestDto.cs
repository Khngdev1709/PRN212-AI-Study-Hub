using System.ComponentModel.DataAnnotations;

namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public class ForgotPasswordRequestDto
  {
    [Required(ErrorMessage = "Email cannot be empty")]
    public string email { get; set; } = string.Empty;
  }
}
