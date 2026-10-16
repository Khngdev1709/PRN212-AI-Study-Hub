using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class DeepSeekOptions
  {
    public const string SectionName = "DeepSeekSettings";
    public string ApiKey { get; set; } = string.Empty;
    public string ModelName { get; set; } = "deepseek-chat";
    public string BaseUrl { get; set; } = "https://api.deepseek.com/chat/completions";
  }
}
