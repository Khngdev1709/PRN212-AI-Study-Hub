namespace PRN212.AIStudyHub.Application.DTOs.Common
{
  public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
  )
  {
    public static PagedResult<T> Create(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
    {
      var totalPages = pageSize > 0 ? (int)Math.Ceiling((double)totalCount / pageSize) : 0;

      return new PagedResult<T>(items, totalCount, pageNumber, pageSize, totalPages);
    }
  }
}
