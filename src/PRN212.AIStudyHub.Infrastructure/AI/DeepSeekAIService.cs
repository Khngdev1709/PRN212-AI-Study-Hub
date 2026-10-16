using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class DeepSeekAIService : IDeepAIService
  {
    private readonly DeepSeekOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;

    public DeepSeekAIService(IOptions<DeepSeekOptions> options, IHttpClientFactory httpClientFactory)
    {
      _options = options.Value;
      _httpClientFactory = httpClientFactory;
    }

    public async Task<DocumentSummaryDto> SummarizeDocumentAsync(string documentContent)
    {
      var systemPrompt = @"Bạn là một trợ lý ảo thông minh. Hãy tóm tắt nội dung chính của tài liệu dưới đây một cách ngắn gọn, dễ hiểu nhưng phải bám sát với những tài liệu đã gửi. Không tự ý lấy thông tin, từ khóa, kiến thức ngoài tài liệu.
Định dạng trả về là một JSON Object hợp lệ gồm 2 trường:
- ""summaryContent"": Nội dung tóm tắt chi tiết, mạch lạc của tài liệu.
- ""keyTakeaways"": Các điểm ghi nhớ cốt lõi hoặc ý chính quan trọng dưới dạng danh sách gạch đầu dòng (chuỗi văn bản hoặc mảng các gạch đầu dòng).
Chỉ trả về chuỗi JSON hợp lệ, không kèm theo giải thích hoặc markdown code block (như ```json).";

      var payload = new
      {
        model = string.IsNullOrWhiteSpace(_options.ModelName) ? "deepseek-chat" : _options.ModelName,
        messages = new object[]
        {
          new { role = "system", content = systemPrompt },
          new { role = "user", content = $"Tài liệu cần tóm tắt:\n{documentContent}" }
        },
        response_format = new { type = "json_object" }
      };

      var rawResponse = await SendChatCompletionAsync(payload);
      var rawText = CleanJsonResponse(rawResponse ?? "{}");

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
        throw new InvalidOperationException($"Lỗi phân tích JSON kết quả tóm tắt từ DeepSeek: {ex.Message}. Nội dung AI trả về: {rawText}", ex);
      }
    }

    public async Task<string> ValidateIntentAsync(string userMessage)
    {
      var systemPrompt = @"Bạn là một bộ lọc AI học thuật. Nhiệm vụ của bạn là kiểm tra xem câu hỏi của người dùng có liên quan đến việc tìm kiếm kiến thức, giải thích khái niệm, hoặc hỏi về tài liệu học tập hay không. Nếu CÓ, chỉ trả lời đúng 1 chữ: `VALID`. Nếu KHÔNG, hãy trả lời bằng một câu xin lỗi ngắn gọn từ chối phục vụ. KHÔNG giải thích gì thêm.";

      var payload = new
      {
        model = string.IsNullOrWhiteSpace(_options.ModelName) ? "deepseek-chat" : _options.ModelName,
        messages = new object[]
        {
          new { role = "system", content = systemPrompt },
          new { role = "user", content = userMessage }
        }
      };

      var rawResponse = await SendChatCompletionAsync(payload);
      return rawResponse?.Trim() ?? string.Empty;
    }

    public async Task<string> ChatAsync(string prompt, string documentContext, IEnumerable<ChatMessage> history)
    {
      var systemPrompt = $@"Bạn là trợ lý học thuật. Hãy trả lời câu hỏi của sinh viên dựa trên TÀI LIỆU được cung cấp bên dưới. 
QUY TẮC NGHIÊM NGẶT:
1. Chỉ sử dụng thông tin nằm trong thẻ <TAI_LIEU>.
2. Nếu thẻ <TAI_LIEU> không chứa đủ thông tin để trả lời, bạn được phép dùng kiến thức nền của mình nhưng PHẢI mở đầu bằng câu: 'Tài liệu không đề cập chi tiết, nhưng theo kiến thức chung...'
3. Tuyệt đối không bịa đặt thông tin.
<TAI_LIEU>
{documentContext}
</TAI_LIEU>";

      var messages = new List<object>
      {
        new { role = "system", content = systemPrompt }
      };

      foreach (var msg in history)
      {
        messages.Add(new
        {
          role = msg.Sender == "AI" ? "assistant" : "user",
          content = msg.Content
        });
      }

      messages.Add(new
      {
        role = "user",
        content = prompt
      });

      var payload = new
      {
        model = string.IsNullOrWhiteSpace(_options.ModelName) ? "deepseek-chat" : _options.ModelName,
        messages = messages
      };

      var rawResponse = await SendChatCompletionAsync(payload);
      return rawResponse?.Trim() ?? string.Empty;
    }

    private async Task<string> SendChatCompletionAsync(object payload)
    {
      var client = _httpClientFactory.CreateClient();
      var endpoint = string.IsNullOrWhiteSpace(_options.BaseUrl)
          ? "https://api.deepseek.com/chat/completions"
          : _options.BaseUrl;

      var jsonPayload = JsonSerializer.Serialize(payload);
      using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
      request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
      request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

      var response = await client.SendAsync(request);
      var responseBody = await response.Content.ReadAsStringAsync();

      if (!response.IsSuccessStatusCode)
      {
        throw new InvalidOperationException($"Lỗi khi gọi DeepSeek API (Status {(int)response.StatusCode}): {responseBody}");
      }

      using var document = JsonDocument.Parse(responseBody);
      if (document.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
      {
        var firstChoice = choices[0];
        if (firstChoice.TryGetProperty("message", out var message) && message.TryGetProperty("content", out var content))
        {
          return content.GetString() ?? string.Empty;
        }
      }

      return string.Empty;
    }

    private static string CleanJsonResponse(string text)
    {
      if (string.IsNullOrWhiteSpace(text))
        return text;

      var cleaned = text.Trim();
      if (cleaned.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
      {
        cleaned = cleaned[7..];
      }
      else if (cleaned.StartsWith("```"))
      {
        cleaned = cleaned[3..];
      }

      if (cleaned.EndsWith("```"))
      {
        cleaned = cleaned[..^3];
      }

      return cleaned.Trim();
    }
  }
}
