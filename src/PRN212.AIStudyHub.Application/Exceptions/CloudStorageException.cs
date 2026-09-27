namespace PRN212.AIStudyHub.Application.Exceptions
{
  public class CloudStorageException : Exception
  {
    public CloudStorageException(string message) : base(message) { }

    public CloudStorageException(string message, Exception? innerException) : base(message, innerException) { }
  }
}
