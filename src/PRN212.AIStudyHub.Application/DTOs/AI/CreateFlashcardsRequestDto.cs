using System;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
  public class CreateFlashcardsRequestDto
  {
    public Guid FlashcardSetId { get; set; }
    public string DocumentContent { get; set; } = string.Empty;
  }
}
