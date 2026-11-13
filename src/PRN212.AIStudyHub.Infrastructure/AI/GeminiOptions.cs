using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class GeminiOptions
  {
    public const string SectionName = "GeminiAI";
    public string ApiKey { get; set; } = string.Empty;
    public string FlashLiteModel { get; set; } = "gemini-3.5-flash-lite";
    public string FlashModel { get; set; } = "gemini-flash-lite-latest";
    public string FallbackModel { get; set; } = "gemini-3.1-flash-lite-preview";
    public string ProModel { get; set; } = string.Empty;
  }
}
