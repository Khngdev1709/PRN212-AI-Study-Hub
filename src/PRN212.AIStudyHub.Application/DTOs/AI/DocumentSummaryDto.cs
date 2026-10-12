using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PRN212.AIStudyHub.Application.DTOs.AI
{
  public class FlexibleStringConverter : JsonConverter<string?>
  {
    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
      if (reader.TokenType == JsonTokenType.String)
      {
        return reader.GetString();
      }

      if (reader.TokenType == JsonTokenType.StartArray)
      {
        var items = new List<string>();
        while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
        {
          if (reader.TokenType == JsonTokenType.String)
          {
            var str = reader.GetString();
            if (!string.IsNullOrWhiteSpace(str))
            {
              items.Add(str.Trim());
            }
          }
        }
        return string.Join("\n", items.Select(item => item.StartsWith("-") ? item : $"- {item}"));
      }

      if (reader.TokenType == JsonTokenType.Null)
      {
        return null;
      }

      using var doc = JsonDocument.ParseValue(ref reader);
      return doc.RootElement.ToString();
    }

    public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
    {
      writer.WriteStringValue(value);
    }
  }

  public class DocumentSummaryDto
  {
    public string SummaryContent { get; set; } = string.Empty;

    [JsonConverter(typeof(FlexibleStringConverter))]
    public string? KeyTakeaways { get; set; }
  }
}
