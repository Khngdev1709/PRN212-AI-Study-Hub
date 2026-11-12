using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
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
    private readonly GeminiAIService _fallbackGeminiService;
    private readonly ILogger<DeepSeekAIService> _logger;

    public DeepSeekAIService(
        IOptions<DeepSeekOptions> options,
        IHttpClientFactory httpClientFactory,
        GeminiAIService fallbackGeminiService,
        ILogger<DeepSeekAIService> logger)
    {
      _options = options.Value;
      _httpClientFactory = httpClientFactory;
      _fallbackGeminiService = fallbackGeminiService;
      _logger = logger;
    }

    public async Task<DocumentSummaryDto> SummarizeDocumentAsync(string documentContent)
    {
      try
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

        var summary = JsonSerializer.Deserialize<DocumentSummaryDto>(rawText, new JsonSerializerOptions
        {
          PropertyNameCaseInsensitive = true
        });

        return summary ?? new DocumentSummaryDto();
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek API error ({Message}). Automatically falling back to Gemini 3.8 Flash for document summarization.", ex.Message);
        return await _fallbackGeminiService.SummarizeDocumentAsync(documentContent);
      }
    }

    public async Task<string> ValidateIntentAsync(string userMessage)
    {
      // Sử dụng trực tiếp Gemini 3.1 Flash Lite để kiểm tra tính học thuật của câu hỏi
      try
      {
        return await _fallbackGeminiService.ValidateIntentAsync(userMessage);
      }
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "Gemini Intent Validation error ({Message}). Falling back to DeepSeek for intent validation...", ex.Message);
        try
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
          return rawResponse?.Trim() ?? "VALID";
        }
        catch
        {
          return "VALID";
        }
      }
    }

    public async Task<string> ChatAsync(string prompt, string documentContext, IEnumerable<ChatMessage> history)
    {
      try
      {
        var systemPrompt = $@"# ROLE
Bạn là một gia sư AI thích ứng thông minh (AI Tutor) trong ứng dụng ""AI Study Hub"". Mục tiêu cốt lõi của bạn là giúp sinh viên nắm vững tài liệu học tập một cách chính xác, tinh tế và linh hoạt điều chỉnh độ sâu câu trả lời theo đúng nhu cầu của người học.

# NGUYÊN TẮC PHẢN HỒI THÍCH ỨNG (ADAPTIVE REASONING & BREVITY)

1. ĐỘ SÂU VÀ MỨC ĐỘ CHI TIẾT (DYNAMIC DEPTH):
- Khi câu hỏi của người dùng ngắn gọn, ít từ, hoặc nhu cầu tra cứu nhanh (ví dụ: 'X là gì?', định nghĩa, công thức, ngày tháng, kết quả trực tiếp, tóm tắt ý chính):
  -> Hãy trả lời NGẮN GỌN, SÚC TÍCH, ĐI THẲNG VÀO TRỌNG TÂM (khoảng 2-4 câu hoặc vài gạch đầu dòng ngắn). Đảm bảo giữ trọn vẹn chi tiết cốt lõi của tài liệu nhưng TUYỆT ĐỐI KHÔNG overthinking, không lan man, không giải thích dài dòng không cần thiết.
- Khi câu hỏi của người dùng dài, phức tạp, hoặc yêu cầu phân tích sâu, so sánh, chứng minh, giải bài tập, viết code:
  -> Hãy trả lời CHI TIẾT, BÀI BẢN, ĐÀO SÂU KIẾN THỨC. Phân tích đa chiều, có cấu trúc rõ ràng với các tiêu đề Markdown (###), danh sách gạch đầu dòng và ví dụ minh họa để đáp ứng trọn vẹn nhu cầu học tập chuyên sâu.

2. TRỰC DIỆN, KHÔNG DÙNG TỪ THỪA (ZERO-FLUFF):
- Tránh các câu mào đầu sáo rỗng như 'Chắc chắn rồi', 'Dưới đây là câu trả lời', 'Dựa trên tài liệu bạn cung cấp...'. Hãy mở đầu ngay bằng câu trả lời cốt lõi hoặc định nghĩa.

3. SỬ DỤNG DỮ LIỆU & KIẾN THỨC MỞ RỘNG (HYBRID KNOWLEDGE):
- Nguồn sự thật ưu tiên số 1 là nội dung trong thẻ <TAI_LIEU>.
- Nếu câu hỏi mang tính học thuật/kỹ thuật mà tài liệu không đề cập đủ: Bạn ĐƯỢC PHÉP dùng kiến thức nền của mình để mở rộng, nhưng BẮT BUỘC mở đầu bằng câu: 'Tài liệu không đề cập chi tiết, nhưng theo kiến thức chung...' trước khi giải thích thêm.
- Tuyệt đối không bịa đặt số liệu nội bộ, số trang hoặc thông tin tác giả độc quyền nếu không có trong tài liệu.

4. TRÌNH BÀY DỄ ĐỌC (SCANNABILITY):
- Sử dụng định dạng Markdown rõ ràng, in đậm (**bold**) các thuật ngữ học thuật quan trọng, ngắt đoạn hợp lý, không viết thành một khối văn bản quá dài.

5. NGÔN NGỮ:
- Luôn trả lời bằng tiếng Việt tự nhiên, chuẩn mực sư phạm (trừ khi người dùng yêu cầu ngôn ngữ khác). KHÔNG bao bọc toàn bộ câu trả lời trong định dạng JSON.

# TÀI LIỆU HỌC TẬP
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
      catch (Exception ex)
      {
        _logger.LogWarning(ex, "DeepSeek API error ({Message}). Automatically falling back to Gemini 3.8 Flash for chat generation.", ex.Message);
        return await _fallbackGeminiService.ChatAsync(prompt, documentContext, history);
      }
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
