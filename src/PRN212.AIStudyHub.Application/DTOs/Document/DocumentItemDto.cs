namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public record DocumentItemDto(
      Guid Id,
      string title,
      string Filename,
      Guid SubjectId,
      string SubjectName,
      DateTime UploadedAt,
      string ProcessingStatus,
      bool IsPublic
      );
}
