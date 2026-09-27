using System.Net;
using System.Text;
using System.Text.Json;

using PRN212.AIStudyHub.Application.DTOs.Common;
using PRN212.AIStudyHub.Application.Exceptions;

namespace PRN212.AIStudyHub.WebAPI.Middlewares
{
  public class GlobalExceptionMiddleware(
      RequestDelegate next,
      ILogger<GlobalExceptionMiddleware> logger,
      IHostEnvironment env)
  {
    public async Task InvokeAsync(HttpContext context)
    {
      try
      {
        await next(context);
      }
      catch (Exception ex)
      {
        await HandleExceptionAsync(context, ex);
      }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
      var (statusCode, message) = exception switch
      {
        BadRequestException ex => (HttpStatusCode.BadRequest, ex.Message),
        ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
        UnauthorizedException ex => (HttpStatusCode.Unauthorized, ex.Message),
        ForbiddenException ex => (HttpStatusCode.Forbidden, ex.Message),
        UnauthorizedAccessException ex => (HttpStatusCode.Forbidden, ex.Message),
        NotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
        KeyNotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
        ConflictException ex => (HttpStatusCode.Conflict, ex.Message),
        CloudStorageException ex => (HttpStatusCode.BadGateway, ex.Message),
        InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
        _ => (HttpStatusCode.InternalServerError, "An unexpected internal server error occurred.")
      };

      var safeMethod = SanitizeForLog(context.Request.Method);
      var safePath = SanitizeForLog(context.Request.Path.ToString());
      var safeExceptionMessage = SanitizeForLog(exception.Message);
      var safeMessage = SanitizeForLog(message);

      if (statusCode == HttpStatusCode.InternalServerError)
      {
        logger.LogError(exception, "Unhandled server error processing {Method} {Path}: {Message}",
            safeMethod, safePath, safeExceptionMessage);
      }
      else
      {
        logger.LogWarning("Handled business exception on {Method} {Path} -> {StatusCode}: {Message}",
            safeMethod, safePath, (int)statusCode, safeMessage);
      }

      context.Response.ContentType = "application/json";
      context.Response.StatusCode = (int)statusCode;

      List<string>? errors = null;
      if (env.IsDevelopment() && statusCode == HttpStatusCode.InternalServerError)
      {
        errors =
        [
          exception.Message,
          exception.StackTrace ?? string.Empty
        ];
      }

      ApiResponse response = ApiResponse.FailureResponse(message, errors);
      JsonSerializerOptions jsonOptions = new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      };

      await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }

    private static string SanitizeForLog(string? input)
    {
      if (string.IsNullOrEmpty(input))
      {
        return string.Empty;
      }

      StringBuilder sb = new StringBuilder(input.Length);
      foreach (var ch in input)
      {
        if (ch is '\r' or '\n')
        {
          continue;
        }

        if (!char.IsControl(ch))
        {
          _ = sb.Append(ch);
        }
      }

      return sb.ToString();
    }
  }
}
