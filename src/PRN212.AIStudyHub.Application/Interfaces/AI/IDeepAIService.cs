using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Application.Interfaces.AI
{
  public interface IDeepAIService
  {
    Task<string> SummarizeDocumentAsync(string documentContent);
    Task<string> ChatAsync(string prompt, string context);
  }
}
