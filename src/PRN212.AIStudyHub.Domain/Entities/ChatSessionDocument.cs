namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class ChatSessionDocument
  {
    public Guid SessionId { get; set; }

    public Guid DocumentId { get; set; }

    public DateTime AttachedAt { get; set; }

    public virtual Document Document { get; set; } = null!;

    public virtual ChatSession Session { get; set; } = null!;
  }
}
