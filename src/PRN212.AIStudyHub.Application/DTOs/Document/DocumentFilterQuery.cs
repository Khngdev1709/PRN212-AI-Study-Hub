namespace PRN212.AIStudyHub.Application.DTOs.Document
{
  public class DocumentFilterQuery
  {
    public string? Keyword { get; set; }

    public Guid? SubjectId { get; set; }

    public string? FileExtension { get; set; }

    public bool? IsPublic { get; set; }

    public Guid? UserId { get; set; }

    public string? SortBy { get; set; } = "uploadedAt_asc";

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
  }
}
