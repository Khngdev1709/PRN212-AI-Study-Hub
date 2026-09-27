namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class FlashcardSet
  {
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? DocumentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Document? Document { get; set; }

    public virtual ICollection<FlashcardItem> FlashcardItem { get; set; } = [];

    public virtual AppUser User { get; set; } = null!;
  }
}
