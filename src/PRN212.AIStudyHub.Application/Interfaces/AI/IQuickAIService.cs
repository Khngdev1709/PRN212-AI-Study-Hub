using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Application.Interfaces.AI
{
  public interface IQuickAIService
  {
    Task<string> GenerateFlashcardsAsync(string documentContent);
  }
}
