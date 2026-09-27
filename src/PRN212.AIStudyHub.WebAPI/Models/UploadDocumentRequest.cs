namespace PRN212.AIStudyHub.WebAPI.Models
{
  public record UploadDocumentRequest(IFormFile File, string Title, Guid SubjectId, bool IsPublic);
}
