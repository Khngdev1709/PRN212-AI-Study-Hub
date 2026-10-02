using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class GeminiOptions
  {
    public const string SectionName = "Gemini";
    public string ApiKey { get; set; } = string.Empty;
    public string FlashModel { get; set; } = string.Empty;
    public string ProModel { get; set; } = string.Empty;
  }
}
