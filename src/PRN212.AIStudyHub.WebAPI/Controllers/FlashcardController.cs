using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.DTOs.Flashcard;
using PRN212.AIStudyHub.Application.Interfaces.Flashcard;
using static PRN212.AIStudyHub.Application.DTOs.Flashcard.FlashcardSetDto;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [Authorize]
  [Route("api/v1/flashcards")]
  [Tags("Flashcards")]
  public class FlashcardController(IFlashcardService flashcardService) : BaseApiController
  {
    /// <summary>
    /// Lấy thông tin thống kê tiến độ học của một bộ Flashcard (Tổng số thẻ, Đã thuộc, Chưa thuộc, Tỷ lệ % hoàn thành)
    /// </summary>
    [HttpGet("sets/{setId:guid}/progress")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardProgressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProgress(
        [FromRoute] Guid setId,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.GetProgressAsync(setId, CurrentUserId, cancellationToken);
      return Ok(ApiResponse<FlashcardProgressDto>.SuccessResponse(result, "Lấy tiến độ bộ Flashcard thành công."));
    }

    /// <summary>
    /// Lấy danh sách thẻ trong bộ Flashcard (hỗ trợ lọc: null = tất cả, true = đã thuộc, false = chưa thuộc)
    /// </summary>
    [HttpGet("sets/{setId:guid}/items")]
    [ProducesResponseType(typeof(ApiResponse<List<FlashcardItemDetailDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFlashcardsBySetId(
        [FromRoute] Guid setId,
        [FromQuery] bool? isFinished,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.GetFlashcardsBySetIdAsync(setId, CurrentUserId, isFinished, cancellationToken);
      return Ok(ApiResponse<List<FlashcardItemDetailDto>>.SuccessResponse(result, "Lấy danh sách thẻ Flashcard thành công."));
    }

    /// <summary>
    /// Cập nhật trực tiếp trạng thái hoàn thành (Đã thuộc / Chưa thuộc) của một thẻ Flashcard
    /// </summary>
    [HttpPut("items/{cardId:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardItemDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCardStatus(
        [FromRoute] Guid cardId,
        [FromBody] UpdateFlashcardStatusRequest request,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.UpdateCardStatusAsync(cardId, CurrentUserId, request, cancellationToken);
      return Ok(ApiResponse<FlashcardItemDetailDto>.SuccessResponse(result, "Cập nhật trạng thái thẻ thành công."));
    }

    /// <summary>
    /// Đảo trạng thái nhanh (Toggle 1-chạm) giữa Đã thuộc và Chưa thuộc của một thẻ Flashcard
    /// </summary>
    [HttpPatch("items/{cardId:guid}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardItemDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleCardStatus(
        [FromRoute] Guid cardId,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.ToggleCardStatusAsync(cardId, CurrentUserId, cancellationToken);
      return Ok(ApiResponse<FlashcardItemDetailDto>.SuccessResponse(result, "Đảo trạng thái thẻ thành công."));
    }

    /// <summary>
    /// Đặt lại toàn bộ tiến độ của bộ thẻ về trạng thái chưa thuộc (isFinished = false) để học lại từ đầu
    /// </summary>
    [HttpPost("sets/{setId:guid}/reset")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetProgress(
        [FromRoute] Guid setId,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.ResetProgressAsync(setId, CurrentUserId, cancellationToken);
      return Ok(ApiResponse<bool>.SuccessResponse(result, "Đặt lại tiến độ học thành công."));
    }

    /// <summary>
    /// Tạo mới một bộ thẻ Flashcard
    /// </summary>
    [HttpPost("sets")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardSetResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateSet(
        [FromBody] CreateFlashcardSetRequest request,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.CreateFlashcardsSetAsync(request, CurrentUserId, cancellationToken);
      return StatusCode(StatusCodes.Status201Created,
          ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result, "Tạo bộ Flashcard thành công."));
    }

    /// <summary>
    /// Lấy danh sách toàn bộ các bộ Flashcard của người dùng hiện tại (kèm % tiến độ hoàn thành)
    /// </summary>
    [HttpGet("sets")]
    [ProducesResponseType(typeof(ApiResponse<List<FlashcardSetResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMySets(CancellationToken cancellationToken)
    {
      var result = await flashcardService.GetMyFlashcardSetAsync(CurrentUserId, cancellationToken);
      return Ok(ApiResponse<List<FlashcardSetResponseDto>>.SuccessResponse(result, "Lấy danh sách bộ Flashcard thành công."));
    }

    /// <summary>
    /// Xem chi tiết thông tin 1 bộ Flashcard theo ID
    /// </summary>
    [HttpGet("sets/{setId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardSetResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSetById(
        [FromRoute] Guid setId,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.GetMyFlashcardSetByIdAsync(setId, CurrentUserId, cancellationToken);
      return Ok(ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result, "Lấy thông tin bộ Flashcard thành công."));
    }

    /// <summary>
    /// Cập nhật tên hoặc mô tả của bộ Flashcard
    /// </summary>
    [HttpPut("sets/{setId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardSetResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSet(
        [FromRoute] Guid setId,
        [FromBody] UpdateFlashcardSetRequest request,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.UpdateSetAsync(setId, CurrentUserId, request, cancellationToken);
      return Ok(ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result, "Cập nhật bộ Flashcard thành công."));
    }

    /// <summary>
    /// Xóa 1 bộ Flashcard (kèm toàn bộ câu hỏi bên trong)
    /// </summary>
    [HttpDelete("sets/{setId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSet(
        [FromRoute] Guid setId,
        CancellationToken cancellationToken)
    {
      var result = await flashcardService.DeleteFlashcardSetAsync(setId, CurrentUserId, cancellationToken);
      return Ok(ApiResponse<bool>.SuccessResponse(result, "Xóa bộ Flashcard thành công."));
    }
  }
}
