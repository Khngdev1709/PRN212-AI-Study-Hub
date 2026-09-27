using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.DTOs.Document;

namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface IDocumentService
  {
    Task<DocumentResponseDto> UploadDocument(
      UploadDocumentCommand request,
      Guid userId,
      CancellationToken cancellationToken = default);

    Task<List<DocumentItemDto>> GetMyDocuments(
      Guid userId,
      Guid? subjectId = null,
      CancellationToken cancellationToken = default);

    Task<DocumentResponseDto> GetDocumentById(
      Guid id,
      Guid userId,
      CancellationToken cancellationToken = default);

    Task<bool> DeleteDocument(
      Guid id,
      Guid userId,
      CancellationToken cancellationToken = default);

    Task<DocumentResponseDto> UpdateDocument(
      Guid id,
      Guid userId,
      UpdateDocumentRequest request,
      CancellationToken cancellationToken = default);

    Task<DocumentResponseDto> UpdateDocumentSubject(
      Guid documentId,
      Guid currentUserId,
      bool isAdmin,
      UpdateDocumentSubjectRequest request,
      CancellationToken cancellationToken = default);

    Task<PagedResult<DocumentResponseDto>> GetDocumentsBySubject(
      Guid subjectId,
      Guid currentUserId,
      int pageNumber,
      int pageSize,
      CancellationToken cancellationToken = default);

    Task<PagedResult<DocumentResponseDto>> GetDocuments(
        DocumentFilterQuery query,
        Guid currentUserId,
        CancellationToken cancellationToken = default);

    Task<DocumentDownloadDto> DownloadDocument(
        Guid id,
        Guid currentUserId,
        CancellationToken cancellationToken = default);
  }
}
