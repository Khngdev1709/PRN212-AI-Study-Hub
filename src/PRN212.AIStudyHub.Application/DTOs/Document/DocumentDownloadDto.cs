namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public record DocumentDownloadDto(
    Stream ContentStream,
    string ContentType,
    string FileName
  );
}
