namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public record DocumentResponseDto(
    Guid Id,
    string Title,
    string FileName,
    string StoragePath,
    string? CloudPublicId,
    bool IsCloudStored,
    long FileSize,
    string FileExtension,
    string ContentType,
    DateTime UploadedAt,
    bool IsPublic,
    Guid SubjectId
    );
}
