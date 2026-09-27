namespace Prn212.AIStudyHub.WPF.Helpers
{
  /// <summary>
  /// Các phương thức tiện ích dùng chung cho hiển thị tài liệu (icon, kích thước file).
  /// Dùng bởi ViewDocumentWindow và PreviewDocumentWindow.
  /// </summary>
  public static class DocumentDisplayHelper
  {
    /// <summary>
    /// Định dạng kích thước file từ bytes sang B/KB/MB/GB/TB.
    /// </summary>
    public static string FormatFileSize(long bytes)
    {
      if (bytes == 0)
      {
        return "0 B";
      }

      string[] sizes = ["B", "KB", "MB", "GB", "TB"];
      double len = bytes;
      int order = 0;

      while (len >= 1024 && order < sizes.Length - 1)
      {
        order++;
        len /= 1024;
      }

      return $"{len:F2} {sizes[order]}";
    }

    /// <summary>
    /// Trả về emoji icon tương ứng với phần mở rộng tệp tin.
    /// </summary>
    public static string GetFileIcon(string? fileExtension)
    {
      string ext = (fileExtension ?? "").ToLower();
      return ext switch
      {
        ".pdf" => "📕",
        ".docx" => "📘",
        ".xlsx" => "📗",
        ".pptx" => "📙",
        ".txt" => "📄",
        ".md" => "📝",
        _ => "📁"
      };
    }
  }
}
