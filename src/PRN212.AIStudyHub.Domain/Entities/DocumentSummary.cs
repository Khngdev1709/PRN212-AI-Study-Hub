namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class DocumentSummary
  {
    public Guid Id { get; set; }

    public Guid DocumentId { get; set; }

    public string SummaryContent { get; set; } = null!;

    public string? KeyTakeaways { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Document Document { get; set; } = null!;
  }
}
