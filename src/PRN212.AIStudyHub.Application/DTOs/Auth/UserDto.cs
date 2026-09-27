namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public record UserDto(Guid Id, string Email, string FirstName, string LastName, string Role, bool IsActive, DateTime CreatedAt, DateTime? UpdatedAt);
}
