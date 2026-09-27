namespace PRN212.AIStudyHub.Domain.Entities
{
  public partial class Document
  {
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid SubjectId { get; set; }

    public string Title { get; set; } = null!;

    public string FileName { get; set; } = null!;

    public string StoragePath { get; set; } = null!;

    public long FileSize { get; set; }

    public string FileExtension { get; set; } = null!;

    public string ContentType { get; set; } = null!;

    public DateTime UploadedAt { get; set; }

    public bool IsCloudStored { get; set; }

    public string? CloudPublicId { get; set; }

    public bool IsPublic { get; set; }

    public string ProcessingStatus { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<ChatSessionDocument> ChatSessionDocument { get; set; } = [];

    public virtual DocumentSummary? DocumentSummary { get; set; }

    public virtual ICollection<FlashcardSet> FlashcardSet { get; set; } = [];

    public virtual Subject Subject { get; set; } = null!;

    public virtual AppUser User { get; set; } = null!;
  }
}
