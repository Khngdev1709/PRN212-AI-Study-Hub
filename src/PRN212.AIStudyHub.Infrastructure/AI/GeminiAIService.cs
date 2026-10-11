using Microsoft.Extensions.Options;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using Google.GenAI;
using Google.GenAI.Types;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Text.Json;
using PRN212.AIStudyHub.Application.DTOs.AI;

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

    public async Task<List<FlashcardDto>> GenerateFlashcardsAsync(string documentContent)
    {
      var prompt = $@"
Bạn là một chuyên gia giáo dục. Hãy đọc tài liệu dưới đây và tạo ra các thẻ nhớ (flashcards) để học sinh ôn tập.
Định dạng trả về là một JSON Array hợp lệ, trong đó mỗi object chứa 2 trường:
- ""question"": Câu hỏi ngắn gọn, trọng tâm để kiểm tra kiến thức.
- ""answer"": Câu trả lời súc tích, chính xác.
Chỉ trả về chuỗi JSON hợp lệ, không kèm theo giải thích hoặc markdown code block (như ```json).

Tài liệu:
{documentContent}
";
      var config = new GenerateContentConfig
      {
        ResponseMimeType = "application/json"
      };

      var response = await _client.Models.GenerateContentAsync(
        model: _modelId,
        contents: prompt,
        config: config
      );

      var rawText = response.Text ?? "[]";

      try
      {
        var flashcards = JsonSerializer.Deserialize<List<FlashcardDto>>(rawText, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true
        });

        return flashcards ?? new List<FlashcardDto>();
      }
      catch (JsonException ex)
      {
        throw new InvalidOperationException($"Lỗi phân tích JSON kết quả Flashcards từ Gemini: {ex.Message}. Nội dung AI trả về: {rawText}", ex);
      }
    }

    public async Task<DocumentSummaryDto> SummarizeDocumentAsync(string documentContent)
    {
      var prompt = $@"
Bạn là một trợ lý ảo thông minh. Hãy tóm tắt nội dung chính của tài liệu dưới đây một cách ngắn gọn, dễ hiểu nhưng phải bám sát với những tài liệu đã gửi. Không tự ý lấy thông tin, từ khóa, kiến thức ngoài tài liệu.
Định dạng trả về là một JSON Object hợp lệ gồm 2 trường:
- ""summaryContent"": Nội dung tóm tắt chi tiết, mạch lạc của tài liệu.
- ""keyTakeaways"": Các điểm ghi nhớ cốt lõi hoặc ý chính quan trọng dưới dạng danh sách gạch đầu dòng.
Chỉ trả về chuỗi JSON hợp lệ, không kèm theo giải thích hoặc markdown code block (như ```json).

Tài liệu:
{documentContent}
";
      var config = new GenerateContentConfig
      {
        ResponseMimeType = "application/json"
      };

      var response = await _client.Models.GenerateContentAsync(
        model: _modelId,
        contents: prompt,
        config: config
      );

      var rawText = response.Text ?? "{}";

      try
      {
        var summary = JsonSerializer.Deserialize<DocumentSummaryDto>(rawText, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true
        });

        return summary ?? new DocumentSummaryDto();
      }
      catch (JsonException ex)
      {
        throw new InvalidOperationException($"Lỗi phân tích JSON kết quả tóm tắt từ Gemini: {ex.Message}. Nội dung AI trả về: {rawText}", ex);
      }
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
