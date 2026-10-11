using System;
using System.Collections.Generic;
using System.Text;

using PRN212.AIStudyHub.Application.DTOs.AI;

namespace PRN212.AIStudyHub.Application.Interfaces.AI
{
  public interface IQuickAIService
  {
    Task<List<FlashcardDto>> GenerateFlashcardsAsync(string documentContent);
  }
}
