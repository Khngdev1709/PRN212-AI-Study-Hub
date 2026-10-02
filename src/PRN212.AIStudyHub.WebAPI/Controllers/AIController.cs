using Microsoft.AspNetCore.Mvc;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces.AI;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [Route("api/[controller]")]
  public class AIController : BaseApiController
  {
    private readonly IQuickAIService _quickAIService;
    private readonly IDeepAIService _deepAIService;

    public AIController(IQuickAIService quickAIService, IDeepAIService deepAIService)
    {
      _quickAIService = quickAIService;
      _deepAIService = deepAIService;
    }

    [HttpPost("flashcards")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateFlashcard([FromBody] AIRequestDto request)
    {
      if (string.IsNullOrWhiteSpace(request.DocumentContent))
        throw new BadRequestException("Nội dung tài liệu không được để trống.");

      var result = await _quickAIService.GenerateFlashcardsAsync(request.DocumentContent);
      return Ok(ApiResponse<string>.SuccessResponse(result, "Tạo Flashcard thành công."));
    }

    [HttpPost("summarize")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SummarizeDocument([FromBody] AIRequestDto request)
    {
      if (string.IsNullOrWhiteSpace(request.DocumentContent))
        throw new BadRequestException("Nội dung tài liệu không được để trống.");

      var result = await _deepAIService.SummarizeDocumentAsync(request.DocumentContent);
      return Ok(ApiResponse<string>.SuccessResponse(result, "Tóm tắt tài liệu thành công."));
    }
  }
}
