namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class Subject
  {
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Document> Document { get; set; } = [];
  }
}
