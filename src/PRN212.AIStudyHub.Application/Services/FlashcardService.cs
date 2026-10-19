using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.DTOs.Flashcard;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Application.Interfaces.Flashcard;
using PRN212.AIStudyHub.Domain.Entities;

using static PRN212.AIStudyHub.Application.DTOs.Flashcard.FlashcardSetDto;

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

    public async Task<bool> ResetProgressAsync(Guid setId, Guid userId, CancellationToken cancellationToken = default)
    {
      var set = await context.FlashcardSets.AsNoTracking()
        .FirstOrDefaultAsync(s => s.Id == setId, cancellationToken)
        ?? throw new NotFoundException($"Thẻ Flashcard với ID {setId} không tồn tại");
      if (set.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền chỉnh sửa thẻ Flashcard này.");
      }

      var masterCards = await context.FlashcardItems.Where(item => item.SetId == setId && item.IsMastered).ToListAsync(cancellationToken);
      if (masterCards.Count != 0)
      {
        foreach (var card in masterCards)
        {
          card.IsMastered = false;
        }
        await context.SaveChangesAsync(cancellationToken);
      }
      return true;
    }

    public async Task<FlashcardItemDetailDto> ToggleCardStatusAsync(Guid cardId, Guid userId, CancellationToken cancellationToken = default)
    {
      var card = await context.FlashcardItems.Include(item => item.Set).FirstOrDefaultAsync(item => item.Id == cardId, cancellationToken) ?? throw new NotFoundException($"Thẻ Flashcard với ID {cardId} không tồn tại");
      if (card.Set.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền chỉnh sửa thẻ Flashcard này.");
      }

      card.IsMastered = !card.IsMastered;
      await context.SaveChangesAsync(cancellationToken);
      return new FlashcardItemDetailDto(
        card.Id,
        card.SetId,
        card.Question,
        card.Answer,
        card.IsMastered,
        card.CreatedAt);
    }

    public async Task<FlashcardItemDetailDto> UpdateCardStatusAsync(Guid cardId, Guid userId, UpdateFlashcardStatusRequest request, CancellationToken cancellationToken = default)
    {
      var card = await context.FlashcardItems.Include(item => item.Set).FirstOrDefaultAsync(item => item.Id == cardId, cancellationToken) ?? throw new NotFoundException($"Thẻ Flashcard với ID {cardId} không tồn tại");
      if (card.Set.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền chỉnh sửa thẻ Flashcard này.");
      }
      card.IsMastered = request.isFinished;
      await context.SaveChangesAsync(cancellationToken);

      return new FlashcardItemDetailDto(
        card.Id,
        card.SetId,
        card.Question,
        card.Answer,
        card.IsMastered,
        card.CreatedAt);
    }
    public async Task<FlashcardSetDto.FlashcardSetResponseDto> CreateFlashcardsSetAsync(FlashcardSetDto.CreateFlashcardSetRequest request, Guid userId, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Title))
      {
        throw new BadRequestException("Tiêu đề bộ Flashcard không được để trống");
      }

      if (request.DocumentId.HasValue)
      {
        var isDocExist = await context.Documents.AsNoTracking().AnyAsync(d => d.Id == request.DocumentId.Value && !d.IsDeleted, cancellationToken);

        if (!isDocExist)
        {
          throw new NotFoundException($"Tài liệu với ID: '{request.DocumentId.Value}' không tồn tại");
        }
      }

      var newSet = new FlashcardSet
      {
        Id = Guid.NewGuid(),
        UserId = userId,
        DocumentId = request.DocumentId,
        Title = request.Title,
        Description = request.Description?.Trim(),
        CreatedAt = DateTime.UtcNow,
      };

      context.FlashcardSets.Add(newSet);
      await context.SaveChangesAsync(cancellationToken);

      return new FlashcardSetResponseDto(
        newSet.Id,
        newSet.UserId,
        newSet.DocumentId,
        newSet.Title,
        newSet.Description,
        TotalCards: 0,
        MasteredCards: 0,
        CompletionPercentage: 0.0,
        newSet.CreatedAt);
    }
    public async Task<List<FlashcardSetDto.FlashcardSetResponseDto>> GetMyFlashcardSetAsync(Guid userId, CancellationToken cancellationToken = default)
    {
      var sets = await context.FlashcardSets.AsNoTracking()
        .Where(s =>  s.UserId == userId)
        .OrderByDescending(s => s.CreatedAt)
        .Select(s => new {Set = s, TotalCards = s.FlashcardItem.Count, MasterCards = s.FlashcardItem.Count(i => i.IsMastered)})
        .ToListAsync(cancellationToken);
      return sets.Select(s => new FlashcardSetResponseDto(
        s.Set.Id,
        s.Set.UserId,
        s.Set.DocumentId,
        s.Set.Title,
        s.Set.Description,
        s.TotalCards,
        s.MasterCards,
        s.TotalCards == 0 ? 0.0 : Math.Round((double)s.MasterCards / s.TotalCards * 100, 1),
        s.Set.CreatedAt
        )).ToList();
    }
    public async Task<FlashcardSetDto.FlashcardSetResponseDto> GetMyFlashcardSetByIdAsync(Guid setId, Guid userId, CancellationToken cancellationToken = default)
    {
      var set = await context.FlashcardSets.AsNoTracking()
        .Include(s => s.FlashcardItem)
        .FirstOrDefaultAsync(s => s.Id == setId, cancellationToken)
        ?? throw new NotFoundException($"Bộ Flashcard với ID: '{setId}' không tồn tại.");

      if (set.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền truy cập vào bộ Flashcard này.");
      }

      var totalCards = set.FlashcardItem.Count;
      var masteredCards = set.FlashcardItem.Count(i => i.IsMastered);
      var percentage = totalCards == 0 ? 0.0 : Math.Round((double)masteredCards / totalCards * 100, 1);

      return new FlashcardSetResponseDto(
        set.Id,
        set.UserId,
        set.DocumentId,
        set.Title,
        set.Description,
        totalCards,
        masteredCards,
        percentage,
        set.CreatedAt);
    }
    public async Task<bool> DeleteFlashcardSetAsync(Guid setId, Guid userId, CancellationToken cancellationToken = default)
    {
      var set = await context.FlashcardSets
        .Include(s=> s.FlashcardItem)
        .FirstOrDefaultAsync(s => s.Id == setId, cancellationToken)
        ?? throw new NotFoundException ($"Bộ Flashcard với ID: '{setId}' không tồn tại.");
      if (set.UserId != userId)
      {
        throw new ForbiddenException("Bạn không có quyền xóa bộ Flashcard này");
      }

      if (set.FlashcardItem.Any())
      {
        context.FlashcardItems.RemoveRange(set.FlashcardItem);
      }

      context.FlashcardSets.Remove(set);
      await context.SaveChangesAsync(cancellationToken);
      return true;
    }
    public async Task<FlashcardSetDto.FlashcardSetResponseDto> UpdateSetAsync(Guid setId, Guid userid, FlashcardSetDto.UpdateFlashcardSetRequest request, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Title))
      {
        throw new BadRequestException("Tiêu đề không được để trống.");
      }

      var isSetExist = await context.FlashcardSets
        .Include(s => s.FlashcardItem)
        .FirstOrDefaultAsync(s => s.Id == setId, cancellationToken)
        ?? throw new NotFoundException($"Bộ Flashcard với ID: '{setId}' không tồn tại.");

      if (isSetExist.UserId != userid)
      {
        throw new ForbiddenException($"Bạn không có quyền chỉnh sửa bộ Flashcard này.");
      }

      isSetExist.Title = request.Title.Trim();
      isSetExist.Description = request.Description?.Trim();

      await context.SaveChangesAsync(cancellationToken);

      var totalCards = isSetExist.FlashcardItem.Count;
      var masteredCards = isSetExist.FlashcardItem.Count(i => i.IsMastered);
      var percentage = totalCards == 0 ? 0.0 : Math.Round((double)masteredCards / totalCards * 100, 1);

      return new FlashcardSetResponseDto(
        isSetExist.Id,
        isSetExist.UserId,
        isSetExist.DocumentId,
        isSetExist.Title,
        isSetExist.Description,
        totalCards, masteredCards, percentage,
        isSetExist.CreatedAt);
    }
  }
}
