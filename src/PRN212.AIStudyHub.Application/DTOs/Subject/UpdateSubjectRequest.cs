using System.ComponentModel.DataAnnotations;

namespace PRN212.AIStudyHub.Application.DTOs.Subject
{
  public record UpdateSubjectRequest
  (
    [Required(ErrorMessage = "Subject name cannot be emptied")]
    string Name,
    string? Description
  );
}
