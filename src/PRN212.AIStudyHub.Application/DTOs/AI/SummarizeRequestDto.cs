using System;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
  public class SummarizeRequestDto
  {
    public Guid DocumentId { get; set; }
    public string DocumentContent { get; set; } = string.Empty;
  }
}
