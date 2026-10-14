using System;
using System.Collections.Generic;
using System.Text;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
  public record FlashcardProgressDto
  (
    Guid setId,
    string setTitle,
    int totalCard,
    int finishedCount,
    int unfinishedCount,
    double completionPercentage
  );

  public record FlashcardItemDetailDto
    (
    Guid Id,
    Guid setId,
    string question,
    string answer,
    bool isFinished,
    DateTime createAt
    );

  public record UpdateFlashcardStatusRequest
    (
    bool isFinished
    );
}
