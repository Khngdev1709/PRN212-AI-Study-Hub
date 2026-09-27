using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface IAppDbContext
  {
    DbSet<AppUser> AppUsers { get; }
    DbSet<ChatMessage> ChatMessages { get; }
    DbSet<ChatSession> ChatSessions { get; }
    DbSet<ChatSessionDocument> ChatSessionDocuments { get; }
    DbSet<Document> Documents { get; }
    DbSet<DocumentSummary> DocumentSummaries { get; }

    DbSet<FlashcardItem> FlashcardItems { get; }

    DbSet<FlashcardSet> FlashcardSets { get; }

    DbSet<RefreshToken> RefreshTokens { get; }

    DbSet<Subject> Subjects { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
  }
}
