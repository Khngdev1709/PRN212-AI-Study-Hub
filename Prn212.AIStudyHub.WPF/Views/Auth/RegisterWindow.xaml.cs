using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;

namespace Prn212.AIStudyHub.WPF.Views.Auth
{
  public partial class RegisterWindow : Window
  {
    private readonly AuthService _authService = new();

    public RegisterWindow()
    {
      InitializeComponent();
    }

    private void BtnRegister_Click(object sender, RoutedEventArgs e)
    {
      HideError();

      string lastName = txtLastName.Text.Trim();
      string firstName = txtFirstName.Text.Trim();
      string email = txtEmail.Text.Trim();
      string password = pwdPassword.Password;
      string confirm = pwdConfirm.Password;

      // Kiểm tra dữ liệu nhập
      if (string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(firstName)
          || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
      {
        ShowError("Vui lòng nhập đầy đủ các trường.");
        return;
      }

      if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
      {
        ShowError("Email không đúng định dạng.");
        return;
      }

      if (password.Length < 6)
      {
        ShowError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      if (password != confirm)
      {
        ShowError("Mật khẩu xác nhận không khớp.");
        return;
      }

      try
      {
        _authService.Register(email, password, firstName, lastName);
        _ = MessageBox.Show("Đăng ký thành công! Bạn có thể đăng nhập ngay.",
                        "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
        Close(); // quay lại màn hình đăng nhập đang mở bên dưới
      }
      catch (InvalidOperationException ex)
      {
        ShowError(ex.Message); // ví dụ: email đã tồn tại
      }
      catch (Exception ex)
      {
        ShowError($"Lỗi: {ex.Message}");
      }
    }

    private void LnkBack_Click(object sender, MouseButtonEventArgs e)
    {
      Close();
    }

    private void ShowError(string message)
    {
      txtError.Text = message;
      txtError.Visibility = Visibility.Visible;
    }

    private void HideError()
    {
      txtError.Visibility = Visibility.Collapsed;
    }
  }
}
