namespace PRN212.AIStudyHub.Infrastructure.Cloud
{
  public class CloudinarySettings
  {
    public const string SectionName = "CloudinarySettings";

    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string Folder { get; set; } = "ai-study-hub/documents";
  }
}
