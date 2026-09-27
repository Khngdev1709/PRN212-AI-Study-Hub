namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public record UpdateDocumentRequest(
    string Title,
    Guid SubjectId,
    bool IsPublic
    );
}
