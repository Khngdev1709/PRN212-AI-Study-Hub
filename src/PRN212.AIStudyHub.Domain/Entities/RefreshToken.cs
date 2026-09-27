namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class RefreshToken
  {
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual AppUser User { get; set; } = null!;
  }
}
