using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.DTOs.Flashcard;

using static PRN212.AIStudyHub.Application.DTOs.Flashcard.FlashcardItemDto;
using static PRN212.AIStudyHub.Application.DTOs.Flashcard.FlashcardSetDto;

namespace PRN212.AIStudyHub.Application.Interfaces.Flashcard
{
  public interface IFlashcardService
  {
    // ================================================
    // DÙNG AI GENERATE FLASHCARD VÀ THEO DÕI TIẾN ĐỘ
    // ================================================

    /// <summary>
    /// Lấy thông tin thống kê tiến độ học của một bộ Flashcard (Tổng số thẻ, Đã thuộc, Chưa thuộc, Tỷ lệ % hoàn thành).
    /// </summary>
    /// <param name="setId">Mã định danh của bộ Flashcard.</param>
    /// <param name="userId">Mã định danh của người dùng hiện tại (xác thực quyền sở hữu).</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    Task<FlashcardProgressDto> GetProgressAsync(
        Guid setId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách các thẻ Flashcard trong một bộ, hỗ trợ lọc theo trạng thái tiến độ (Tất cả, Đã thuộc, hoặc Chưa thuộc).
    /// </summary>
    /// <param name="setId">Mã định danh của bộ Flashcard.</param>
    /// <param name="userId">Mã định danh của người dùng hiện tại.</param>
    /// <param name="isFinished">Trạng thái lọc: null = Lấy tất cả, true = Chỉ thẻ đã thuộc, false = Chỉ thẻ chưa thuộc.</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    Task<List<FlashcardItemDetailDto>> GetFlashcardsBySetIdAsync(
        Guid setId,
        Guid userId,
        bool? isFinished = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật trực tiếp trạng thái hoàn thành (Đã thuộc / Chưa thuộc) của một thẻ Flashcard cụ thể.
    /// </summary>
    /// <param name="cardId">Mã định danh của thẻ Flashcard.</param>
    /// <param name="userId">Mã định danh của người dùng hiện tại.</param>
    /// <param name="request">Dữ liệu yêu cầu chứa trạng thái mới (isFinished).</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    Task<FlashcardItemDetailDto> UpdateCardStatusAsync(
        Guid cardId,
        Guid userId,
        UpdateFlashcardStatusRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Đảo trạng thái nhanh (Toggle) giữa Đã thuộc và Chưa thuộc của một thẻ Flashcard.
    /// Thích hợp khi học sinh lật thẻ và đánh dấu nhanh trên giao diện.
    /// </summary>
    /// <param name="cardId">Mã định danh của thẻ Flashcard.</param>
    /// <param name="userId">Mã định danh của người dùng hiện tại.</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    Task<FlashcardItemDetailDto> ToggleCardStatusAsync(
        Guid cardId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Đặt lại toàn bộ tiến độ của một bộ thẻ về trạng thái chưa thuộc (isFinished = false) để học sinh ôn tập lại từ đầu.
    /// </summary>
    /// <param name="setId">Mã định danh của bộ Flashcard.</param>
    /// <param name="userId">Mã định danh của người dùng hiện tại.</param>
    /// <param name="cancellationToken">Token hủy tác vụ.</param>
    Task<bool> ResetProgressAsync(
        Guid setId,
        Guid userId,
        CancellationToken cancellationToken = default);

    // ================================================
    // QUẢN LÝ BỘ THẺ (FLASHCARD SET)
    // ================================================

    Task<FlashcardSetResponseDto> CreateFlashcardsSetAsync(
        CreateFlashcardSetRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<List<FlashcardSetResponseDto>> GetMyFlashcardSetAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<FlashcardSetResponseDto> GetMyFlashcardSetByIdAsync(
        Guid setId,
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<FlashcardSetResponseDto> UpdateSetAsync(
        Guid setId,
        Guid userid,
        UpdateFlashcardSetRequest request,
        CancellationToken cancellationToken = default);
    Task<bool> DeleteFlashcardSetAsync(
        Guid setId,
        Guid userId,
        CancellationToken cancellationToken = default);

    // ================================================
    // QUẢN LÝ THẺ THỦ CÔNG (MANUAL ITEM MANAGEMENT)
    // ================================================

    /// <summary>
    /// Thêm 1 thẻ Flashcard mới thủ công vào bộ thẻ.
    /// </summary>
    Task<FlashcardItemDetailDto> CreateCardAsync(
        Guid setId,
        Guid userId,
        CreateFlashcardItemRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật nội dung câu hỏi và câu trả lời của 1 thẻ Flashcard.
    /// </summary>
    Task<FlashcardItemDetailDto> UpdateCardContentAsync(
        Guid cardId,
        Guid userId,
        UpdateFlashcardItemRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Xóa 1 thẻ Flashcard khỏi bộ thẻ.
    /// </summary>
    Task<bool> DeleteCardAsync(
        Guid cardId,
        Guid userId,
        CancellationToken cancellationToken = default);

    // ================================================
    // QUẢN LÝ THẺ DO AI SINH RA (AI GENERATED CARDS)
    // ================================================

    /// <summary>
    /// Lưu danh sách các thẻ Flashcard do AI sinh ra vào bộ thẻ (có kiểm tra quyền sở hữu).
    /// </summary>
    Task<List<FlashcardItemDetailDto>> AddGeneratedCardsAsync(
        Guid setId,
        Guid userId,
        List<FlashcardDto> flashcards,
        CancellationToken cancellationToken = default);
  }
}
