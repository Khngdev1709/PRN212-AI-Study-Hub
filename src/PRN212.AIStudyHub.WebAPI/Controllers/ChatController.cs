using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using PRN212.AIStudyHub.Domain.Entities;
using PRN212.AIStudyHub.Infrastructure.Data;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
    [Authorize]
    [Route("api/chat")]
    [Route("api/v1/chat")]
    [Tags("AI")]
    public class ChatController : BaseApiController
    {
        private readonly IDeepAIService _deepAIService;
        private readonly AistudyHubDbContext _dbContext;

        public ChatController(IDeepAIService deepAIService, AistudyHubDbContext dbContext)
        {
            _deepAIService = deepAIService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Lấy danh sách các phiên chat của người dùng hiện tại
        /// </summary>
        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var sessions = await _dbContext.ChatSession
                .Where(s => s.UserId == CurrentUserId)
                .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.CreatedAt,
                    s.UpdatedAt,
                    MessageCount = s.ChatMessage.Count,
                    Documents = s.ChatSessionDocument.Select(csd => new
                    {
                        csd.Document.Id,
                        csd.Document.Title,
                        csd.Document.FileName,
                        csd.Document.FileSize,
                        csd.Document.FileExtension
                    }).ToList()
                })
                .ToListAsync();

            return Ok(Application.DTOs.Common.ApiResponse<object>.SuccessResponse(sessions, "Fetched chat sessions successfully."));
        }

        /// <summary>
        /// Lấy chi tiết phiên chat và các tài liệu đính kèm
        /// </summary>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSessionDetails(Guid sessionId)
        {
            var session = await _dbContext.ChatSession
                .Include(s => s.ChatSessionDocument)
                .ThenInclude(csd => csd.Document)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == CurrentUserId);

            if (session == null)
            {
                return NotFound("Session not found or unauthorized.");
            }

            var result = new
            {
                session.Id,
                session.Title,
                session.CreatedAt,
                session.UpdatedAt,
                Documents = session.ChatSessionDocument.Select(csd => new
                {
                    csd.Document.Id,
                    csd.Document.Title,
                    csd.Document.FileName,
                    csd.Document.FileSize,
                    csd.Document.FileExtension
                }).ToList()
            };

            return Ok(Application.DTOs.Common.ApiResponse<object>.SuccessResponse(result, "Fetched session details successfully."));
        }

        /// <summary>
        /// Lấy toàn bộ tin nhắn trong một phiên chat
        /// </summary>
        [HttpGet("session/{sessionId}/messages")]
        public async Task<IActionResult> GetSessionMessages(Guid sessionId)
        {
            var session = await _dbContext.ChatSession
                .Include(s => s.ChatSessionDocument)
                .ThenInclude(csd => csd.Document)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == CurrentUserId);

            if (session == null)
            {
                return NotFound("Session not found or unauthorized.");
            }

            var messages = await _dbContext.ChatMessage
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.SessionId,
                    m.Sender,
                    m.Content,
                    m.SentAt
                })
                .ToListAsync();

            var documents = session.ChatSessionDocument.Select(csd => new
            {
                csd.Document.Id,
                csd.Document.Title,
                csd.Document.FileName,
                csd.Document.FileSize,
                csd.Document.FileExtension
            }).ToList();

            return Ok(Application.DTOs.Common.ApiResponse<object>.SuccessResponse(new
            {
                Session = new
                {
                    session.Id,
                    session.Title,
                    session.CreatedAt,
                    session.UpdatedAt,
                    Documents = documents
                },
                Messages = messages
            }, "Fetched session messages successfully."));
        }

        /// <summary>
        /// Tạo phiên chat mới
        /// </summary>
        [HttpPost("session")]
        public async Task<IActionResult> CreateSession([FromBody] CreateChatSessionDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title cannot be empty.");
            }

            var sessionId = Guid.NewGuid();
            var chatSession = new ChatSession
            {
                Id = sessionId,
                UserId = CurrentUserId,
                Title = request.Title.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ChatSession.Add(chatSession);

            if (request.DocumentIds != null && request.DocumentIds.Any())
            {
                foreach (var docId in request.DocumentIds)
                {
                    _dbContext.ChatSessionDocument.Add(new ChatSessionDocument
                    {
                        SessionId = sessionId,
                        DocumentId = docId,
                        AttachedAt = DateTime.UtcNow
                    });
                }
            }

            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<Guid>.SuccessResponse(sessionId, "Session created successfully."));
        }

        /// <summary>
        /// Đổi tên phiên chat
        /// </summary>
        [HttpPut("session/{sessionId}")]
        public async Task<IActionResult> RenameSession(Guid sessionId, [FromBody] RenameChatSessionDto request)
        {
            if (string.IsNullOrWhiteSpace(request?.Title))
            {
                return BadRequest("Title cannot be empty.");
            }

            var session = await _dbContext.ChatSession.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == CurrentUserId);
            if (session == null)
            {
                return NotFound("Session not found or unauthorized.");
            }

            session.Title = request.Title.Trim();
            session.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<bool>.SuccessResponse(true, "Session renamed successfully."));
        }

        /// <summary>
        /// Xóa phiên chat
        /// </summary>
        [HttpDelete("session/{sessionId}")]
        public async Task<IActionResult> DeleteSession(Guid sessionId)
        {
            var session = await _dbContext.ChatSession
                .Include(s => s.ChatMessage)
                .Include(s => s.ChatSessionDocument)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == CurrentUserId);

            if (session == null)
            {
                return NotFound("Session not found or unauthorized.");
            }

            _dbContext.ChatMessage.RemoveRange(session.ChatMessage);
            _dbContext.ChatSessionDocument.RemoveRange(session.ChatSessionDocument);
            _dbContext.ChatSession.Remove(session);

            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<bool>.SuccessResponse(true, "Session deleted successfully."));
        }

        /// <summary>
        /// Cập nhật danh sách tài liệu gắn với phiên chat
        /// </summary>
        [HttpPost("session/{sessionId}/documents")]
        public async Task<IActionResult> UpdateSessionDocuments(Guid sessionId, [FromBody] UpdateSessionDocumentsDto request)
        {
            var session = await _dbContext.ChatSession.FindAsync(sessionId);
            if (session == null || session.UserId != CurrentUserId)
            {
                return NotFound("Session not found or unauthorized.");
            }

            // Remove old links
            var existingLinks = await _dbContext.ChatSessionDocument
                .Where(csd => csd.SessionId == sessionId)
                .ToListAsync();
            _dbContext.ChatSessionDocument.RemoveRange(existingLinks);

            // Add new links
            if (request.DocumentIds != null && request.DocumentIds.Any())
            {
                foreach (var docId in request.DocumentIds)
                {
                    _dbContext.ChatSessionDocument.Add(new ChatSessionDocument
                    {
                        SessionId = sessionId,
                        DocumentId = docId,
                        AttachedAt = DateTime.UtcNow
                    });
                }
            }

            session.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<bool>.SuccessResponse(true, "Session documents updated successfully."));
        }

        /// <summary>
        /// Gửi câu hỏi cho AI (luồng RAG 2 bước)
        /// </summary>
        [HttpPost("query")]
        public async Task<IActionResult> Query([FromBody] ChatQueryDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var session = await _dbContext.ChatSession.FindAsync(request.SessionId);
            if (session == null || session.UserId != CurrentUserId)
            {
                return NotFound("Session not found or unauthorized.");
            }

            // STEP 1: Validate Intent (Lightweight AI filter, no DB yet)
            string validationResult;
            try
            {
                validationResult = await _deepAIService.ValidateIntentAsync(request.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Application.DTOs.Common.ApiResponse.FailureResponse($"AI Filter error: {ex.Message}"));
            }

            // Save user message (must save whether valid or not)
            var userMsg = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                Sender = "User",
                Content = request.Message,
                SentAt = DateTime.UtcNow
            };
            _dbContext.ChatMessage.Add(userMsg);
            session.UpdatedAt = DateTime.UtcNow;

            // If invalid intent, save rejection and return early
            if (!validationResult.Equals("VALID", StringComparison.OrdinalIgnoreCase))
            {
                var rejectionMsg = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SessionId = request.SessionId,
                    Sender = "AI",
                    Content = validationResult,
                    SentAt = DateTime.UtcNow
                };
                _dbContext.ChatMessage.Add(rejectionMsg);
                await _dbContext.SaveChangesAsync();

                return Ok(Application.DTOs.Common.ApiResponse<string>.SuccessResponse(validationResult, "Query rejected by intent filter"));
            }

            // STEP 2: RAG Context & Generation (Intent is VALID)
            // Get Sliding Window History
            var recentMessages = await _dbContext.ChatMessage
                .Where(m => m.SessionId == request.SessionId && m.Sender != "System")
                .OrderByDescending(m => m.SentAt)
                .Take(10)
                .ToListAsync();
            recentMessages.Reverse();

            // Get RAG Context
            var documents = await _dbContext.ChatSessionDocument
                .Include(csd => csd.Document)
                .ThenInclude(d => d.DocumentSummary)
                .Where(csd => csd.SessionId == request.SessionId)
                .ToListAsync();

            var contextChunks = new System.Text.StringBuilder();
            foreach (var doc in documents)
            {
                if (doc.Document != null)
                {
                    contextChunks.AppendLine($"[Document: {doc.Document.Title} ({doc.Document.FileName})]");
                    if (doc.Document.DocumentSummary != null)
                    {
                        if (!string.IsNullOrWhiteSpace(doc.Document.DocumentSummary.SummaryContent))
                        {
                            contextChunks.AppendLine(doc.Document.DocumentSummary.SummaryContent);
                        }
                        if (!string.IsNullOrWhiteSpace(doc.Document.DocumentSummary.KeyTakeaways))
                        {
                            contextChunks.AppendLine(doc.Document.DocumentSummary.KeyTakeaways);
                        }
                    }
                    contextChunks.AppendLine();
                }
            }

            await _dbContext.SaveChangesAsync(); // Save user message before step 2 calling AI

            // Call AI
            string aiResponseText;
            try
            {
                aiResponseText = await _deepAIService.ChatAsync(request.Message, contextChunks.ToString(), recentMessages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Application.DTOs.Common.ApiResponse.FailureResponse($"AI Service error: {ex.Message}"));
            }

            // Save AI response
            var aiMsg = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                Sender = "AI",
                Content = aiResponseText,
                SentAt = DateTime.UtcNow
            };
            _dbContext.ChatMessage.Add(aiMsg);
            session.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<string>.SuccessResponse(aiResponseText, "Query successful"));
        }
    }
}
