using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Infrastructure.Data
{
  public partial class AistudyHubDbContext(DbContextOptions<AistudyHubDbContext> options) : DbContext(options)
  {
    public virtual DbSet<AppUser> AppUser { get; set; }

    public virtual DbSet<ChatMessage> ChatMessage { get; set; }

    public virtual DbSet<ChatSession> ChatSession { get; set; }

    public virtual DbSet<ChatSessionDocument> ChatSessionDocument { get; set; }

    public virtual DbSet<Document> Document { get; set; }

    public virtual DbSet<DocumentSummary> DocumentSummary { get; set; }

    public virtual DbSet<FlashcardItem> FlashcardItem { get; set; }

    public virtual DbSet<FlashcardSet> FlashcardSet { get; set; }

    public virtual DbSet<RefreshToken> RefreshToken { get; set; }

    public virtual DbSet<Subject> Subject { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      _ = modelBuilder.Entity<AppUser>(entity =>
      {
        _ = entity.HasKey(e => e.Id).HasName("PR_AppUser");

        _ = entity.HasIndex(e => e.Email, "UQ__AppUser__A9D10534142CC53F").IsUnique();

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        _ = entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
        _ = entity.Property(e => e.FirstName).HasMaxLength(100);
        _ = entity.Property(e => e.IsActive).HasDefaultValue(true);
        _ = entity.Property(e => e.LastName).HasMaxLength(100);
        _ = entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
        _ = entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Student");
      });

      _ = modelBuilder.Entity<ChatMessage>(entity =>
      {
        _ = entity.HasIndex(e => e.SessionId, "IX_ChatMessage_SessionId");

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.Sender)
                .HasMaxLength(20)
                .IsUnicode(false);
        _ = entity.Property(e => e.SentAt).HasDefaultValueSql("(sysutcdatetime())");

        _ = entity.HasOne(d => d.Session).WithMany(p => p.ChatMessage)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK_ChatMessage_ChatSession");
      });

      _ = modelBuilder.Entity<ChatSession>(entity =>
      {
        _ = entity.HasIndex(e => e.UserId, "IX_ChatSession_UserId");

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        _ = entity.Property(e => e.Title).HasMaxLength(255);

        _ = entity.HasOne(d => d.User).WithMany(p => p.ChatSession)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_ChatSession_AppUser");
      });

      _ = modelBuilder.Entity<ChatSessionDocument>(entity =>
      {
        _ = entity.HasKey(e => new { e.SessionId, e.DocumentId });

        _ = entity.HasIndex(e => e.DocumentId, "IX_ChatSessionDocument_DocumentId");

        _ = entity.Property(e => e.AttachedAt).HasDefaultValueSql("(sysutcdatetime())");

        _ = entity.HasOne(d => d.Document).WithMany(p => p.ChatSessionDocument)
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CSD_Document");

        _ = entity.HasOne(d => d.Session).WithMany(p => p.ChatSessionDocument)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK_CSD_ChatSession");
      });

      _ = modelBuilder.Entity<Document>(entity =>
      {
        _ = entity.HasIndex(e => new { e.IsDeleted, e.SubjectId }, "IX_Document_IsDeleted_SubjectId");

        _ = entity.HasIndex(e => e.SubjectId, "IX_Document_SubjectId");

        _ = entity.HasIndex(e => e.UserId, "IX_Document_UserId");

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CloudPublicId).HasMaxLength(500);
        _ = entity.Property(e => e.ContentType)
                .HasMaxLength(100)
                .IsUnicode(false);
        _ = entity.Property(e => e.FileExtension)
                .HasMaxLength(10)
                .IsUnicode(false);
        _ = entity.Property(e => e.FileName).HasMaxLength(255);
        _ = entity.Property(e => e.ProcessingStatus)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Pending");
        _ = entity.Property(e => e.StoragePath).HasMaxLength(2048);
        _ = entity.Property(e => e.Title).HasMaxLength(255);
        _ = entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

        _ = entity.HasOne(d => d.Subject).WithMany(p => p.Document)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK_Document_Subject");

        _ = entity.HasOne(d => d.User).WithMany(p => p.Document)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Document_AppUser");
      });

      _ = modelBuilder.Entity<DocumentSummary>(entity =>
      {
        _ = entity.HasIndex(e => e.DocumentId, "IX_DocumentSummary_DocumentId");

        _ = entity.HasIndex(e => e.DocumentId, "UQ__Document__1ABEEF0E36270CD4").IsUnique();

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

        _ = entity.HasOne(d => d.Document).WithOne(p => p.DocumentSummary)
                .HasForeignKey<DocumentSummary>(d => d.DocumentId)
                .HasConstraintName("FK_DocumentSummary_Document");
      });

      _ = modelBuilder.Entity<FlashcardItem>(entity =>
      {
        _ = entity.HasIndex(e => e.SetId, "IX_FlashcardItem_SetId");

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

        _ = entity.HasOne(d => d.Set).WithMany(p => p.FlashcardItem)
                .HasForeignKey(d => d.SetId)
                .HasConstraintName("FK_FlashcardItem_FlashcardSet");
      });

      _ = modelBuilder.Entity<FlashcardSet>(entity =>
      {
        _ = entity.HasIndex(e => e.DocumentId, "IX_FlashcardSet_DocumentId");

        _ = entity.HasIndex(e => e.UserId, "IX_FlashcardSet_UserId");

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        _ = entity.Property(e => e.Description).HasMaxLength(500);
        _ = entity.Property(e => e.Title).HasMaxLength(255);

        _ = entity.HasOne(d => d.Document).WithMany(p => p.FlashcardSet)
                .HasForeignKey(d => d.DocumentId)
                .HasConstraintName("FK_FlashcardSet_Document");

        _ = entity.HasOne(d => d.User).WithMany(p => p.FlashcardSet)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_FlashcardSet_AppUser");
      });

      _ = modelBuilder.Entity<RefreshToken>(entity =>
      {
        _ = entity.HasIndex(e => e.UserId, "IX_RefreshToken_UserId");

        _ = entity.HasIndex(e => e.Token, "UQ__RefreshT__1EB4F817B4D062CE").IsUnique();

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        _ = entity.Property(e => e.Token)
                .HasMaxLength(500)
                .IsUnicode(false);

        _ = entity.HasOne(d => d.User).WithMany(p => p.RefreshToken)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_RefreshToken_AppUser");
      });

      _ = modelBuilder.Entity<Subject>(entity =>
      {
        _ = entity.HasIndex(e => e.Name, "UQ__Subject__737584F64DCE1AC5").IsUnique();

        _ = entity.Property(e => e.Id).HasDefaultValueSql("(newsequentialid())");
        _ = entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        _ = entity.Property(e => e.Description).HasMaxLength(500);
        _ = entity.Property(e => e.Name).HasMaxLength(100);
      });

      OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
  }
}
