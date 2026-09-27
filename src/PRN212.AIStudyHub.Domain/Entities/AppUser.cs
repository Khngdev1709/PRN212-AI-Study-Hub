namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class AppUser
  {
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Role { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ChatSession> ChatSession { get; set; } = [];

    public virtual ICollection<Document> Document { get; set; } = [];

    public virtual ICollection<FlashcardSet> FlashcardSet { get; set; } = [];

    public virtual ICollection<RefreshToken> RefreshToken { get; set; } = [];
  }
}
