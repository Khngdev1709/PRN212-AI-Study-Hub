using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Options;
using PRN212.AIStudyHub.Application.DTOs.AI;
using PRN212.AIStudyHub.Application.Interfaces.AI;
using PRN212.AIStudyHub.Domain.Entities;

namespace PRN212.AIStudyHub.Infrastructure.AI
{
  public class GeminiAIService : IQuickAIService, IDeepAIService
  {
    private readonly Client _client;
    private readonly string _liteModelId;   // Gemini 3.1 Flash Lite: Flashcards & Kiểm tra Intent câu hỏi
    private readonly string _flashModelId;  // Gemini 3.8 Flash: Model dự phòng cho Tóm tắt tài liệu & Hỏi đáp Chatbox
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GeminiOptions _options;

    public GeminiAIService(IOptions<GeminiOptions> options, IHttpClientFactory httpClientFactory)
    {
      _options = options.Value;
      var apiKey = _options.ApiKey;
      _liteModelId = !string.IsNullOrWhiteSpace(_options.FlashLiteModel)
          ? _options.FlashLiteModel
          : "gemini-3.1-flash-lite";

      _flashModelId = !string.IsNullOrWhiteSpace(_options.FlashModel)
          ? _options.FlashModel
          : (!string.IsNullOrWhiteSpace(_options.FallbackModel) ? _options.FallbackModel : "gemini-3.8-flash");

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
        model: _liteModelId,
        contents: prompt,
        config: config
      );

      var rawText = CleanJsonResponse(response.Text ?? "[]");

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
- ""keyTakeaways"": Các điểm ghi nhớ cốt lõi hoặc ý chính quan trọng dưới dạng danh sách gạch đầu dòng (chuỗi văn bản hoặc mảng các gạch đầu dòng).
Chỉ trả về chuỗi JSON hợp lệ, không kèm theo giải thích hoặc markdown code block (như ```json).

Tài liệu:
{documentContent}
";
      var config = new GenerateContentConfig
      {
        ResponseMimeType = "application/json"
      };

      var candidateModels = new List<string>();
      if (!string.IsNullOrWhiteSpace(_flashModelId)) candidateModels.Add(_flashModelId);
      if (!candidateModels.Contains(_liteModelId, StringComparer.OrdinalIgnoreCase)) candidateModels.Add(_liteModelId);

      Exception? lastEx = null;
      string lastRawText = "{}";

      foreach (var model in candidateModels)
      {
        try
        {
          var response = await _client.Models.GenerateContentAsync(
            model: model,
            contents: prompt,
            config: config
          );

          var rawText = CleanJsonResponse(response.Text ?? "{}");
          lastRawText = rawText;

          var summary = JsonSerializer.Deserialize<DocumentSummaryDto>(rawText, new JsonSerializerOptions
          {
            PropertyNameCaseInsensitive = true
          });

          if (summary != null)
            return summary;
        }
        catch (Exception ex)
        {
          lastEx = ex;
        }
      }

      throw new InvalidOperationException($"Lỗi phân tích JSON kết quả tóm tắt từ Gemini: {lastEx?.Message}. Nội dung AI trả về: {lastRawText}", lastEx);
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

      var jsonPayload = JsonSerializer.Serialize(payload);
      var content = new System.Net.Http.StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

      var client = _httpClientFactory.CreateClient();
      var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_liteModelId}:generateContent?key={_options.ApiKey}";

      var response = await client.PostAsync(url, content);
      response.EnsureSuccessStatusCode();

      var responseBody = await response.Content.ReadAsStringAsync();
      using var document = JsonDocument.Parse(responseBody);

      var parts = document.RootElement
          .GetProperty("candidates")[0]
          .GetProperty("content")
          .GetProperty("parts");

      string? aiText = null;
      foreach (var part in parts.EnumerateArray())
      {
        if (part.TryGetProperty("thought", out var isThought) && isThought.GetBoolean())
          continue;

        if (part.TryGetProperty("text", out var textElem))
          aiText = (aiText == null ? "" : aiText) + textElem.GetString();
      }

      return aiText?.Trim() ?? string.Empty;
    }

    public async Task<string> ChatAsync(string prompt, string documentContext, IEnumerable<ChatMessage> history)
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

      var contents = new List<object>();
      foreach (var msg in history)
      {
        contents.Add(new
        {
          role = msg.Sender == "AI" ? "model" : "user",
          parts = new[] { new { text = msg.Content } }
        });
      }

      contents.Add(new
      {
        role = "user",
        parts = new[] { new { text = prompt } }
      });

      var payload = new
      {
        system_instruction = new { parts = new[] { new { text = systemPrompt } } },
        contents = contents,
        generationConfig = new
        {
          temperature = 0.4,
          maxOutputTokens = 2048
        }
      };

      var jsonPayload = JsonSerializer.Serialize(payload);
      var content = new System.Net.Http.StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

      // Danh sách model ưu tiên: Model chính (3.8 Flash) -> nếu quá tải/lỗi 503 -> tự động chuyển sang 3.5 Flash hoặc 3.1 Flash Lite
      var candidateModels = new List<string>();
      if (!string.IsNullOrWhiteSpace(_flashModelId)) candidateModels.Add(_flashModelId);
      if (!candidateModels.Contains("gemini-3.5-flash", StringComparer.OrdinalIgnoreCase)) candidateModels.Add("gemini-3.5-flash");
      if (!candidateModels.Contains(_liteModelId, StringComparer.OrdinalIgnoreCase)) candidateModels.Add(_liteModelId);

      var client = _httpClientFactory.CreateClient();
      string lastError = string.Empty;

      foreach (var model in candidateModels)
      {
        try
        {
          var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_options.ApiKey}";
          var response = await client.PostAsync(url, content);
          var responseBody = await response.Content.ReadAsStringAsync();

          if (!response.IsSuccessStatusCode)
          {
            lastError = $"Model {model} returned status {(int)response.StatusCode}: {responseBody}";
            continue;
          }

          using var document = JsonDocument.Parse(responseBody);
          var parts = document.RootElement
              .GetProperty("candidates")[0]
              .GetProperty("content")
              .GetProperty("parts");

          string? aiText = null;
          foreach (var part in parts.EnumerateArray())
          {
            if (part.TryGetProperty("thought", out var isThought) && isThought.GetBoolean())
              continue;

            if (part.TryGetProperty("text", out var textElem))
              aiText = (aiText == null ? "" : aiText) + textElem.GetString();
          }

          if (!string.IsNullOrWhiteSpace(aiText))
          {
            return aiText.Trim();
          }
        }
        catch (Exception ex)
        {
          lastError = $"Exception on model {model}: {ex.Message}";
        }
      }

      throw new InvalidOperationException($"Tất cả các model Gemini dự phòng đều không thể phản hồi ({lastError})");
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
