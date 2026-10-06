using System;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
    public class ChatQueryDto
    {
        public Guid SessionId { get; set; }
        public string Message { get; set; } = null!;
    }
}
