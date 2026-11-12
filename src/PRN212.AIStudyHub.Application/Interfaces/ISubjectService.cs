using PRN212.AIStudyHub.Application.DTOs.Subject;

namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface ISubjectService
  {
    Task<List<SubjectDto>> GetAllSubjects(
      CancellationToken cancellationToken = default);
    Task<SubjectDto> CreateSubject(
      CreateSubjectRequest request,
      CancellationToken cancellationToken = default);
    Task<SubjectDto> UpdateSubject(
      Guid id,
      UpdateSubjectRequest request,
      CancellationToken cancellationToken = default);
    Task DeleteSubject(
      Guid id,
      CancellationToken cancellationToken = default);
  }
}
