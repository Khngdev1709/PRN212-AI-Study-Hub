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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GeminiOptions _options;

    public GeminiAIService(IOptions<GeminiOptions> options, IHttpClientFactory httpClientFactory)
    {
      _options = options.Value; 
      var apiKey = _options.ApiKey;
      _modelId = string.IsNullOrWhiteSpace(_options.FlashModel) ? "gemini-1.5-flash-latest" : _options.FlashModel;
      
      _client = new Client(apiKey: apiKey);
      _httpClientFactory = httpClientFactory;
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

    public async Task<string> ValidateIntentAsync(string userMessage)
    {
      var systemPrompt = @"Bạn là một bộ lọc AI học thuật. Nhiệm vụ của bạn là kiểm tra xem câu hỏi của người dùng có liên quan đến việc tìm kiếm kiến thức, giải thích khái niệm, hoặc hỏi về tài liệu học tập hay không. Nếu CÓ, chỉ trả lời đúng 1 chữ: `VALID`. Nếu KHÔNG, hãy trả lời bằng một câu xin lỗi ngắn gọn từ chối phục vụ. KHÔNG giải thích gì thêm.";
      
      var payload = new
      {
        system_instruction = new { parts = new[] { new { text = systemPrompt } } },
        contents = new[] {
            new { role = "user", parts = new[] { new { text = userMessage } } }
        }
      };

      var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);
      var content = new System.Net.Http.StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

      var client = _httpClientFactory.CreateClient();
      var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:generateContent?key={_options.ApiKey}";
      
      var response = await client.PostAsync(url, content);
      response.EnsureSuccessStatusCode();

      var responseBody = await response.Content.ReadAsStringAsync();
      using var document = System.Text.Json.JsonDocument.Parse(responseBody);
      
      var aiText = document.RootElement
          .GetProperty("candidates")[0]
          .GetProperty("content")
          .GetProperty("parts")[0]
          .GetProperty("text")
          .GetString();

      return aiText?.Trim() ?? string.Empty;
    }

    public async Task<string> ChatAsync(string prompt, string documentContext, IEnumerable<PRN212.AIStudyHub.Domain.Entities.ChatMessage> history)
    {
      var systemPrompt = $@"Bạn là trợ lý học thuật. Hãy trả lời câu hỏi của sinh viên dựa trên TÀI LIỆU được cung cấp bên dưới. 
QUY TẮC NGHIÊM NGẶT:
1. Chỉ sử dụng thông tin nằm trong thẻ <TAI_LIEU>.
2. Nếu thẻ <TAI_LIEU> không chứa đủ thông tin để trả lời, bạn được phép dùng kiến thức nền của mình nhưng PHẢI mở đầu bằng câu: 'Tài liệu không đề cập chi tiết, nhưng theo kiến thức chung...'
3. Tuyệt đối không bịa đặt thông tin.
<TAI_LIEU>
{documentContext}
</TAI_LIEU>";

      var contents = new List<object>();
      foreach (var msg in history)
      {
        contents.Add(new {
          role = msg.Sender == "AI" ? "model" : "user",
          parts = new[] { new { text = msg.Content } }
        });
      }

      contents.Add(new {
        role = "user",
        parts = new[] { new { text = prompt } }
      });

      var payload = new
      {
        system_instruction = new { parts = new[] { new { text = systemPrompt } } },
        contents = contents
      };

      var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);
      var content = new System.Net.Http.StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

      var client = _httpClientFactory.CreateClient();
      var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:generateContent?key={_options.ApiKey}";
      
      var response = await client.PostAsync(url, content);
      response.EnsureSuccessStatusCode();

      var responseBody = await response.Content.ReadAsStringAsync();
      using var document = System.Text.Json.JsonDocument.Parse(responseBody);
      
      var aiText = document.RootElement
          .GetProperty("candidates")[0]
          .GetProperty("content")
          .GetProperty("parts")[0]
          .GetProperty("text")
          .GetString();

      return aiText ?? string.Empty;
    }
  }
}
