using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.DTOs.Document;
using PRN212.AIStudyHub.Application.DTOs.Subject;
using PRN212.AIStudyHub.Application.Exceptions;
using PRN212.AIStudyHub.Application.Interfaces;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [Authorize]
  [Route("api/v1/subjects")]
  public class SubjectController(ISubjectService subjectService, IDocumentService documentService) : BaseApiController
  {
    /// <summary>
    /// Lấy toàn bộ danh mục môn học trong hệ thống
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<SubjectDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSubjects(CancellationToken cancellationToken)
    {
      var result = await subjectService.GetAllSubjects(cancellationToken);
      return Ok(ApiResponse<List<SubjectDto>>.SuccessResponse(result, "Fetched all subjects successfully."));
    }

    /// <summary>
    /// Tạo mới môn học
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateSubject(
      [FromBody] CreateSubjectRequest request,
      CancellationToken cancellationToken)
    {
      var result = await subjectService.CreateSubject(request, cancellationToken);
      return StatusCode(StatusCodes.Status201Created,
        ApiResponse<SubjectDto>.SuccessResponse(result, "Subject created successfully."));
    }

    /// <summary>
    /// Lấy danh sách tài liệu theo môn học có phân trang (chỉ gồm tài liệu cá nhân hoặc tài liệu công khai)
    /// </summary>
    [HttpGet("{subjectId:guid}/documents")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<DocumentResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentsBySubject(
      [FromRoute] Guid subjectId,
      [FromQuery] int pageNumber = 1,
      [FromQuery] int pageSize = 10,
      CancellationToken cancellationToken = default)
    {
      if (subjectId == Guid.Empty)
      {
        throw new BadRequestException("SubjectId must not be empty.");
      }

      if (pageNumber < 1)
      {
        throw new BadRequestException("Page number must be greater than or equal to 1.");
      }

      if (pageSize is < 1 or > 100)
      {
        throw new BadRequestException("Page size must be between 1 and 100");
      }

      var result = await documentService.GetDocumentsBySubject(
        subjectId,
        CurrentUserId,
        pageNumber,
        pageSize,
        cancellationToken);

      return Ok(ApiResponse<PagedResult<DocumentResponseDto>>.SuccessResponse(
        result,
        "Fetched documents by subject successfully."));
    }
  }
}
