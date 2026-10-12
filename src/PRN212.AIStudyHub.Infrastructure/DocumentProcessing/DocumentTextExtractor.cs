using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using PRN212.AIStudyHub.Application.Interfaces;
using UglyToad.PdfPig;

namespace PRN212.AIStudyHub.Infrastructure.DocumentProcessing
{
  public class DocumentTextExtractor : IDocumentTextExtractor
  {
    private const int MaxPagesToExtract = 30;
    private const int MaxCharacters = 100_000;

    public async Task<string> ExtractTextAsync(Stream stream, string fileExtension, CancellationToken cancellationToken = default)
    {
      if (stream == null || stream.Length == 0)
        return string.Empty;

      var ext = fileExtension.ToLowerInvariant();

      try
      {
        if (ext == ".txt" || ext == ".md")
        {
          return await ExtractFromPlainTextAsync(stream, cancellationToken);
        }

        if (ext == ".pdf")
        {
          return ExtractFromPdf(stream);
        }

        if (ext == ".docx")
        {
          return ExtractFromDocx(stream);
        }

        if (ext == ".pptx")
        {
          return ExtractFromPptx(stream);
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[TextExtractor Warning]: Lỗi trích xuất văn bản từ file ({ext}): {ex.Message}");
      }

      return string.Empty;
    }

    private static async Task<string> ExtractFromPlainTextAsync(Stream stream, CancellationToken cancellationToken)
    {
      if (stream.CanSeek)
        stream.Position = 0;

      using var reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);
      var content = await reader.ReadToEndAsync(cancellationToken);
      return content.Length > MaxCharacters ? content[..MaxCharacters] : content;
    }

    private static string ExtractFromPdf(Stream stream)
    {
      if (stream.CanSeek)
        stream.Position = 0;

      var sb = new StringBuilder();

      using var document = PdfDocument.Open(stream);
      var pageCount = Math.Min(document.NumberOfPages, MaxPagesToExtract);

      for (var i = 1; i <= pageCount; i++)
      {
        var page = document.GetPage(i);
        if (!string.IsNullOrWhiteSpace(page.Text))
        {
          sb.AppendLine(page.Text);
        }

        if (sb.Length >= MaxCharacters)
          break;
      }

      var result = sb.ToString();
      return result.Length > MaxCharacters ? result[..MaxCharacters] : result;
    }

    private static string ExtractFromDocx(Stream stream)
    {
      if (stream.CanSeek)
        stream.Position = 0;

      using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);
      var entry = archive.GetEntry("word/document.xml");
      if (entry == null)
        return string.Empty;

      using var entryStream = entry.Open();
      var xdoc = XDocument.Load(entryStream);
      XNamespace w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

      var sb = new StringBuilder();
      foreach (var para in xdoc.Descendants(w + "p"))
      {
        var text = string.Concat(para.Descendants(w + "t").Select(t => t.Value));
        if (!string.IsNullOrWhiteSpace(text))
        {
          sb.AppendLine(text);
          if (sb.Length >= MaxCharacters)
            break;
        }
      }

      var result = sb.ToString();
      return result.Length > MaxCharacters ? result[..MaxCharacters] : result;
    }

    private static string ExtractFromPptx(Stream stream)
    {
      if (stream.CanSeek)
        stream.Position = 0;

      using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);
      var slideEntries = archive.Entries
        .Where(e => e.FullName.StartsWith("ppt/slides/slide", StringComparison.OrdinalIgnoreCase) && e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
        .OrderBy(e => e.FullName);

      var sb = new StringBuilder();
      XNamespace a = "http://schemas.openxmlformats.org/drawingml/2006/main";

      foreach (var entry in slideEntries)
      {
        using var entryStream = entry.Open();
        var xdoc = XDocument.Load(entryStream);
        foreach (var textNode in xdoc.Descendants(a + "t"))
        {
          if (!string.IsNullOrWhiteSpace(textNode.Value))
          {
            sb.AppendLine(textNode.Value);
            if (sb.Length >= MaxCharacters)
              break;
          }
        }

        if (sb.Length >= MaxCharacters)
          break;
      }

      var result = sb.ToString();
      return result.Length > MaxCharacters ? result[..MaxCharacters] : result;
    }
  }
}
