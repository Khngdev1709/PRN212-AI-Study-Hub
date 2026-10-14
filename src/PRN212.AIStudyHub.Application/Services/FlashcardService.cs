using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Application.Interfaces.Flashcard;

namespace PRN212.AIStudyHub.Application.Services
{
  public class FlashcardService(IAppDbContext context) : IFlashcardService
  {
    public async Task<List<FlashcardItemDetailDto>> GetFlashcardsBySetIdAsync(Guid setId, Guid userId, bool? isFinished = null, CancellationToken cancellationToken = default)
    {
      // Kiểm tra thẻ có tồn tại và thẻ có thuộc về user này không
      var existSet = await context.FlashcardSets.AsNoTracking().FirstOrDefaultAsync(s => s.Id == setId, cancellationToken) ?? throw new NotFoundException($"Bộ Flashcard với ID {setId} không tồn tại.");
      if (existSet.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền truy cập vào bộ Flashcard này");
      }

      var progressCards = context.FlashcardItems.AsNoTracking().Where(item => item.SetId == setId);

      // Nếu user truyền vào bộ lọc: true (chỉ lấy đã thuộc), false (chỉ lấy chưa thuộc)
      if(isFinished.HasValue)
      {
        progressCards = progressCards.Where(item => item.IsMastered == isFinished.Value);
      }
      var items = await progressCards.OrderBy(item => item.CreatedAt).Select(item => new FlashcardItemDetailDto(
        item.Id,
        item.SetId,
        item.Question,
        item.Answer,
        item.IsMastered,
        item.CreatedAt)).ToListAsync(cancellationToken);
      return items;
    }

    public async Task<FlashcardProgressDto> GetProgressAsync(Guid setId, Guid userId, CancellationToken cancellationToken = default)
    {
      // Kiểm tra thẻ có tồn tại và thẻ có thuộc về user này không
      var existSet = await context.FlashcardSets.AsNoTracking().FirstOrDefaultAsync(s => s.Id == setId, cancellationToken) ?? throw new NotFoundException($"Bộ Flashcard với ID {setId} không tồn tại.");
      if (existSet.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền truy cập vào bộ Flashcard này");
      }

      // Lấy thống kê số lượng thẻ và số thẻ đã thuộc
      var progressCards = context.FlashcardItems.AsNoTracking().Where(item =>  item.SetId == setId);
      var totalCards = await progressCards.CountAsync(cancellationToken);

      if (totalCards == 0)
      {
        return new FlashcardProgressDto(
          setId,
          existSet.Title,
          totalCard: 0,
          finishedCount: 0,
          unfinishedCount: 0,
          completionPercentage: 0.0);
      }

      var finishedCount = await progressCards.CountAsync(item => item.IsMastered, cancellationToken);
      var unfinishedCount = totalCards - finishedCount;

      var completionPercentage = Math.Round((double)finishedCount / totalCards * 100, 1);

      return new FlashcardProgressDto(
        setId,
        existSet.Title,
        totalCards,
        finishedCount,
        unfinishedCount,
        completionPercentage);
    }

    public Task<bool> ResetProgressAsync(Guid setId, Guid userId, CancellationToken cancellationToken = default)
    {
      throw new NotImplementedException();
    }

    public Task<FlashcardItemDetailDto> ToggleCardStatusAsync(Guid cardId, Guid userId, CancellationToken cancellationToken = default)
    {
      throw new NotImplementedException();
    }

    public Task<FlashcardItemDetailDto> UpdateCardStatusAsync(Guid cardId, Guid userId, UpdateFlashcardStatusRequest request, CancellationToken cancellationToken = default)
    {
      throw new NotImplementedException();
    }
  }
}
