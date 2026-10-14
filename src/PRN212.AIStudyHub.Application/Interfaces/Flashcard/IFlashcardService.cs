using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using PRN212.AIStudyHub.Application.DTOs.AI;

namespace PRN212.AIStudyHub.Application.Interfaces.Flashcard
{
  public interface IFlashcardService
  {
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
  }
}
