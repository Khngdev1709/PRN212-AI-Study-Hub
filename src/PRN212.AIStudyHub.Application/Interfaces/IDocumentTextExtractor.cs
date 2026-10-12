using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PRN212.AIStudyHub.Application.Interfaces
{
  public interface IDocumentTextExtractor
  {
    Task<string> ExtractTextAsync(Stream stream, string fileExtension, CancellationToken cancellationToken = default);
  }
}
