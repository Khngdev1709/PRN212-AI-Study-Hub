using System;

namespace PRN212.AIStudyHub.Application.DTOs.Flashcard
{
  public class FlashcardItemDto
  {
    public record CreateFlashcardItemRequest(
      string Question,
      string Answer);

    public record UpdateFlashcardItemRequest(
      string Question,
      string Answer);
  }
}
