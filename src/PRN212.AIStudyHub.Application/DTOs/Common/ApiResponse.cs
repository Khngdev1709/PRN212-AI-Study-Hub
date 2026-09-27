namespace PRN212.AIStudyHub.Application.DTOs.Common
{
  public class ApiResponse<T>
  {
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> SuccessResponse(T? data, string message = "Success")
    {
      return new()
      {
        Success = true,
        Message = message,
        Data = data
      };
    }

    public static ApiResponse<T> FailureResponse(string message, List<string>? errors = null)
    {
      return new()
      {
        Success = false,
        Message = message,
        Errors = errors
      };
    }
  }

  public class ApiResponse : ApiResponse<object>
  {
    public static ApiResponse SuccessResponse(string message = "Success")
    {
      return new()
      {
        Success = true,
        Message = message
      };
    }

    public static new ApiResponse FailureResponse(string message, List<string>? errors = null)
    {
      return new()
      {
        Success = false,
        Message = message,
        Errors = errors
      };
    }
  }
}
