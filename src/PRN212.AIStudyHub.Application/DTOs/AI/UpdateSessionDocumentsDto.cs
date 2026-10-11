using System;
using System.Collections.Generic;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
    public class UpdateSessionDocumentsDto
    {
        public List<Guid> DocumentIds { get; set; } = new List<Guid>();
    }
}
