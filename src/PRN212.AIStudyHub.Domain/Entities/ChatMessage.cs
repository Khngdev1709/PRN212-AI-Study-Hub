namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class ChatMessage
  {
    public Guid Id { get; set; }

    public Guid SessionId { get; set; }

    public string Sender { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime SentAt { get; set; }

    public virtual ChatSession Session { get; set; } = null!;
  }
}
