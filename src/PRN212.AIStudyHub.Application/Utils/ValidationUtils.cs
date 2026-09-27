using System.Text.RegularExpressions;

namespace PRN212.AIStudyHub.Application.Utils
{
  public static class ValidationUtils
  {
    public static bool IsValidEmail(string email)
    {
      if (string.IsNullOrEmpty(email))
      {
        return false;
      }

      string emailPattern = @"^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$";
      return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase); // Cho phép 4 loại mai : Gmail, Outlook, Hotmail, yahoo
    }
    public static bool IsValidName(string name)
    {
      if (string.IsNullOrWhiteSpace(name))
      {
        return false;
      }

      string namePattern = @"^[\p{L}\s]+$";                           // Hỗ trợ tiếng Việt và khoảng trắng
      return Regex.IsMatch(name, namePattern);
    }
  }
}
