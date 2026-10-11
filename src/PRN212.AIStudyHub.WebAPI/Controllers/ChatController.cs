using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using PRN212.AIStudyHub.Domain.Entities;
using PRN212.AIStudyHub.Infrastructure.Data;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
    [Route("api/chat")]
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
                Title = request.Title,
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

            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<bool>.SuccessResponse(true, "Session documents updated successfully."));
        }

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
                return StatusCode(500, $"AI Filter error: {ex.Message}");
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
                if (doc.Document.DocumentSummary != null)
                {
                    contextChunks.AppendLine($"[Document: {doc.Document.Title}]");
                    contextChunks.AppendLine(doc.Document.DocumentSummary.SummaryContent);
                    contextChunks.AppendLine(doc.Document.DocumentSummary.KeyTakeaways);
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
                return StatusCode(500, $"AI Service error: {ex.Message}");
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
            await _dbContext.SaveChangesAsync();

            return Ok(Application.DTOs.Common.ApiResponse<string>.SuccessResponse(aiResponseText, "Query successful"));
        }
    }
}
