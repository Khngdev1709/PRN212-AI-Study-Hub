namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class FlashcardItem
  {
    public Guid Id { get; set; }

    public Guid SetId { get; set; }

    public string Question { get; set; } = null!;

    public string Answer { get; set; } = null!;

    public bool IsMastered { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual FlashcardSet Set { get; set; } = null!;
  }
}
