using System.Text.Json.Serialization;

namespace PRN212.AIStudyHub.Application.DTOs.Auth
{
  public class GoogleUserInfo
  {
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
  }
}
