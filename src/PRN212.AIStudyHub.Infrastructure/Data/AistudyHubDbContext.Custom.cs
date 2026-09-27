using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Infrastructure.Data
{
  public partial class AistudyHubDbContext : IAppDbContext
  {
    public DbSet<AppUser> AppUsers => AppUser;
    public DbSet<ChatMessage> ChatMessages => ChatMessage;
    public DbSet<ChatSession> ChatSessions => ChatSession;
    public DbSet<ChatSessionDocument> ChatSessionDocuments => ChatSessionDocument;
    public DbSet<Document> Documents => Document;
    public DbSet<DocumentSummary> DocumentSummaries => DocumentSummary;
    public DbSet<FlashcardItem> FlashcardItems => FlashcardItem;
    public DbSet<FlashcardSet> FlashcardSets => FlashcardSet;
    public DbSet<RefreshToken> RefreshTokens => RefreshToken;
    public DbSet<Subject> Subjects => Subject;
  }
}
