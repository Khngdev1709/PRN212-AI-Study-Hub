using Microsoft.EntityFrameworkCore;

using PRN212.AIStudyHub.Application.DTOs.Subject;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Application.Services
{
  public class SubjectService(IAppDbContext context) : ISubjectService
  {
    public async Task<SubjectDto> CreateSubject(CreateSubjectRequest request, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Name))
      {
        throw new BadRequestException("Subject name is required.");
      }

      var isExist = await context.Subjects
          .AnyAsync(s => s.Name.ToLower() == request.Name.ToLower(), cancellationToken);

      if (isExist)
      {
        throw new ConflictException($"Subject '{request.Name}' already exists in system.");
      }

      Subject newSubject = new Subject
      {
        Id = Guid.CreateVersion7(),
        Name = request.Name.Trim(),
        Description = request.Description?.Trim(),
        CreatedAt = DateTime.UtcNow,
      };
      _ = context.Subjects.Add(newSubject);
      _ = await context.SaveChangesAsync(cancellationToken);

      return new SubjectDto(newSubject.Id, newSubject.Name, newSubject.Description, newSubject.CreatedAt);
    }

    public async Task<SubjectDto> UpdateSubject(Guid id, UpdateSubjectRequest request, CancellationToken cancellationToken = default)
    {
      if (string.IsNullOrWhiteSpace(request.Name))
      {
        throw new BadRequestException("Subject name is required.");
      }

      var subject = await context.Subjects
        .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
        ?? throw new NotFoundException($"Subject with Id '{id}' was not found.");

      var isExist = await context.Subjects
        .AnyAsync(s => s.Id != id && s.Name.ToLower() == request.Name.ToLower(), cancellationToken);

      if (isExist)
      {
        throw new ConflictException($"Subject '{request.Name}' already exists in system.");
      }

      subject.Name = request.Name.Trim();
      subject.Description = request.Description?.Trim();

      await context.SaveChangesAsync(cancellationToken);

      return new SubjectDto(subject.Id, subject.Name, subject.Description, subject.CreatedAt);
    }

    public async Task DeleteSubject(Guid id, CancellationToken cancellationToken = default)
    {
      var subject = await context.Subjects
        .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
        ?? throw new NotFoundException($"Subject with Id '{id}' was not found.");

      var hasDocuments = await context.Documents
        .AnyAsync(d => d.SubjectId == id && !d.IsDeleted, cancellationToken);

      if (hasDocuments)
      {
        throw new BadRequestException("Không thể xóa môn học vì vẫn còn tài liệu bên trong. Vui lòng xóa hoặc di chuyển các tài liệu trước.");
      }

      context.Subjects.Remove(subject);
      await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<SubjectDto>> GetAllSubjects(CancellationToken cancellationToken = default)
    {
      return await context.Subjects
          .AsNoTracking()
          .OrderBy(s => s.Name)
          .Select(s => new SubjectDto(s.Id, s.Name, s.Description, s.CreatedAt))
          .ToListAsync(cancellationToken);
    }
  }
}
