using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using PRN212.AIStudyHub.Application.Interfaces.Flashcard;
using PRN212.AIStudyHub.Domain.Entities;
using PRN212.AIStudyHub.Infrastructure.Data;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [Authorize]
  [Route("api/[controller]")]
  [Route("api/v1/[controller]")]
  [Tags("AI")]
  public class AIController : BaseApiController
  {
    private readonly IQuickAIService _quickAIService;
    private readonly IDeepAIService _deepAIService;
    private readonly IFlashcardService _flashcardService;
    private readonly AistudyHubDbContext _dbContext;

    public AIController(
      IQuickAIService quickAIService,
      IDeepAIService deepAIService,
      IFlashcardService flashcardService,
      AistudyHubDbContext dbContext)
    {
      _quickAIService = quickAIService;
      _deepAIService = deepAIService;
      _flashcardService = flashcardService;
      _dbContext = dbContext;
    }

    [HttpPost("flashcards")]
    [ProducesResponseType(typeof(ApiResponse<List<FlashcardItemDetailDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateFlashcard(
        [FromBody] CreateFlashcardsRequestDto request,
        CancellationToken cancellationToken)
    {
      if (request.FlashcardSetId == Guid.Empty)
        throw new BadRequestException("FlashcardSetId không được để trống.");

      // Nếu người dùng không truyền trực tiếp DocumentContent, tự động tìm nội dung từ Document / DocumentSummary tương ứng
      if (string.IsNullOrWhiteSpace(request.DocumentContent))
      {
        var set = await _dbContext.FlashcardSet.FirstOrDefaultAsync(s => s.Id == request.FlashcardSetId, cancellationToken);
        if (set?.DocumentId != null)
        {
          var summary = await _dbContext.DocumentSummary.FirstOrDefaultAsync(ds => ds.DocumentId == set.DocumentId, cancellationToken);
          if (summary != null)
          {
            request.DocumentContent = $"{summary.SummaryContent}\n{summary.KeyTakeaways}".Trim();
          }

          if (string.IsNullOrWhiteSpace(request.DocumentContent))
          {
            var doc = await _dbContext.Documents.FirstOrDefaultAsync(d => d.Id == set.DocumentId, cancellationToken);
            if (doc != null)
            {
              request.DocumentContent = $"Tài liệu môn học: {doc.Title}";
            }
          }
        }
      }

      if (string.IsNullOrWhiteSpace(request.DocumentContent))
        throw new BadRequestException("Nội dung tài liệu không được để trống.");

      var dtoList = await _quickAIService.GenerateFlashcardsAsync(request.DocumentContent);

      var items = await _flashcardService.AddGeneratedCardsAsync(
          request.FlashcardSetId,
          CurrentUserId,
          dtoList,
          cancellationToken);

      return Ok(ApiResponse<List<FlashcardItemDetailDto>>.SuccessResponse(items, "Tạo Flashcard thành công."));
    }

    [HttpPost("summarize")]
    [ProducesResponseType(typeof(ApiResponse<DocumentSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SummarizeDocument([FromBody] SummarizeRequestDto request)
    {
      if (request.DocumentId == Guid.Empty)
        throw new BadRequestException("DocumentId không được để trống.");

      // Nếu DocumentContent trống, kiểm tra xem bản tóm tắt đã được tạo sẵn trong DB chưa
      if (string.IsNullOrWhiteSpace(request.DocumentContent))
      {
        var existing = await _dbContext.DocumentSummary.FirstOrDefaultAsync(ds => ds.DocumentId == request.DocumentId);
        if (existing != null && !string.IsNullOrWhiteSpace(existing.SummaryContent))
        {
          var existingDto = new DocumentSummaryDto
          {
            SummaryContent = existing.SummaryContent,
            KeyTakeaways = existing.KeyTakeaways ?? string.Empty
          };
          return Ok(ApiResponse<DocumentSummaryDto>.SuccessResponse(existingDto, "Lấy tóm tắt tài liệu thành công."));
        }

        var doc = await _dbContext.Documents.FirstOrDefaultAsync(d => d.Id == request.DocumentId);
        if (doc != null)
        {
          request.DocumentContent = $"Tài liệu học tập: {doc.Title}";
        }
      }

      if (string.IsNullOrWhiteSpace(request.DocumentContent))
        throw new BadRequestException("Nội dung tài liệu không được để trống.");

      var dto = await _deepAIService.SummarizeDocumentAsync(request.DocumentContent);

      var existingSummary = await _dbContext.DocumentSummary.FirstOrDefaultAsync(ds => ds.DocumentId == request.DocumentId);
      if (existingSummary != null)
      {
        existingSummary.SummaryContent = dto.SummaryContent;
        existingSummary.KeyTakeaways = dto.KeyTakeaways;
        existingSummary.UpdatedAt = DateTime.UtcNow;
      }
      else
      {
        var summaryEntity = new DocumentSummary
        {
          Id = Guid.NewGuid(),
          DocumentId = request.DocumentId,
          SummaryContent = dto.SummaryContent,
          KeyTakeaways = dto.KeyTakeaways,
          CreatedAt = DateTime.UtcNow
        };
        _dbContext.DocumentSummary.Add(summaryEntity);
      }

      await _dbContext.SaveChangesAsync();

      return Ok(ApiResponse<DocumentSummaryDto>.SuccessResponse(dto, "Tóm tắt tài liệu thành công."));
    }

    [HttpGet("summary/{documentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DocumentSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentSummary([FromRoute] Guid documentId)
    {
      var summary = await _dbContext.DocumentSummary.FirstOrDefaultAsync(ds => ds.DocumentId == documentId);
      if (summary == null)
      {
        return NotFound(ApiResponse.FailureResponse("Chưa có tóm tắt cho tài liệu này."));
      }

      var dto = new DocumentSummaryDto
      {
        SummaryContent = summary.SummaryContent,
        KeyTakeaways = summary.KeyTakeaways ?? string.Empty
      };
      return Ok(ApiResponse<DocumentSummaryDto>.SuccessResponse(dto, "Lấy tóm tắt tài liệu thành công."));
    }
  }
}
