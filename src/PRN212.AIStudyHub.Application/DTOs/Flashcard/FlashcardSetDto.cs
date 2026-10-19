using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Application.DTOs.Flashcard
{
  public class FlashcardSetDto
  {
    public record CreateFlashcardSetRequest(
      string Title,
      string? Description,
      Guid? DocumentId = null);

    public record UpdateFlashcardSetRequest(
      string Title,
      string? Description);

    public record FlashcardSetResponseDto(
      Guid Id,
      Guid UserId,
      Guid? DocumentId,
      string Title,
      string? Description,
      int TotalCards,
      int MasteredCards,
      double CompletionPercentage,
      DateTime CreatedAt);
  }
}
