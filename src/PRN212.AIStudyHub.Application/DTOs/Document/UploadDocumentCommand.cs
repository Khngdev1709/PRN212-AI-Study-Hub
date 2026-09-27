namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public record UploadDocumentCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize,
    string Title,
    Guid SubjectId,
    bool IsPublic
    );
}
