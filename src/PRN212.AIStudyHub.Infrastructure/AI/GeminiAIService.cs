using Microsoft.Extensions.Options;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using Google.GenAI;
using Google.GenAI.Types;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class GeminiAIService : IDeepAIService, IQuickAIService
  {
    private readonly Client _client;
    private readonly string _modelId;

    public GeminiAIService(IOptions<GeminiOptions> options)
    {
      var config = options.Value; 
      var apiKey = config.ApiKey;
      _modelId = string.IsNullOrWhiteSpace(config.FlashModel) ? "gemini-1.5-flash-latest" : config.FlashModel;
      
      _client = new Client(apiKey: apiKey);
    }

    public async Task<string> GenerateFlashcardsAsync(string documentContent)
    {
      var prompt = $@"
Bạn là một chuyên gia giáo dục. Hãy đọc tài liệu dưới đây và tạo ra các thẻ nhớ (flashcards) để học sinh ôn tập.
Định dạng mỗi flashcard theo dạng JSON array chứa các object: {{ ""question"": """", ""answer"": """" }}
Chỉ trả về chuỗi JSON hợp lệ, không kèm theo markdown (như ```json) hay văn bản nào khác.

Tài liệu:
{documentContent}
";
      var response = await _client.Models.GenerateContentAsync(_modelId, prompt);
      return response.Text ?? string.Empty;
    }

    public async Task<string> SummarizeDocumentAsync(string documentContent)
    {
      var prompt = $@"
Bạn là một trợ lý ảo thông minh. Hãy tóm tắt nội dung chính của tài liệu dưới đây một cách ngắn gọn, dễ hiểu nhưng phải bám sát với những tài liệu đã gửi. Không tự ý lấy thông tin, từ khóa, kiến thức ngoài tài liệu.

Tài liệu:
{documentContent}
";
      var response = await _client.Models.GenerateContentAsync(_modelId, prompt);
      return response.Text ?? string.Empty;
    }

    public Task<string> ChatAsync(string prompt, string context)
    {
      throw new NotImplementedException();
    }
  }
}
