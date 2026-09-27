namespace PRN212.AIStudyHub.Application.DTOs.Cloud
{
  public record CloudUploadResult(string PublicId, string Url, string SecureUrl, long Bytes, string Format);
}
