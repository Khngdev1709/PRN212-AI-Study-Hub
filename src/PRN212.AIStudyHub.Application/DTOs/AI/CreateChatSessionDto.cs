using System;
using System.Collections.Generic;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
    public class CreateChatSessionDto
    {
        public string Title { get; set; } = null!;
        public List<Guid> DocumentIds { get; set; } = new List<Guid>();
    }
}
