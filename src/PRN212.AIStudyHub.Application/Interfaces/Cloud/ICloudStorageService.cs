using PRN212.AIStudyHub.Application.DTOs.Cloud;

namespace PRN212.AIStudyHub.Application.Interfaces.Cloud
{
  public interface ICloudStorageService
  {
    Task<CloudUploadResult> UploadRawFile(
      Stream fileStream,
      string fileName,
      CancellationToken cancellationToken = default);

    Task<Stream> DownloadFileStream(
      string fileUrl,
      CancellationToken cancellationToken = default);
  }
}
