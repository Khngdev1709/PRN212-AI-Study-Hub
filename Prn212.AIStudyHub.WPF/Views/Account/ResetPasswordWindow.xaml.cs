using System.Windows;

namespace Prn212.AIStudyHub.WPF.Views.Account
{
  /// <summary>
  /// Màn hình đổi mật khẩu: xác minh mật khẩu cũ, nhập mật khẩu mới.
  /// </summary>
  public partial class ResetPasswordWindow : Window
  {
    private readonly AccountService _accountService = new();

    public ResetPasswordWindow()
    {
      InitializeComponent();

      if (App.CurrentUser != null)
      {
        txtEmail.Text = App.CurrentUser.Email;
      }
    }

    private async void btnChangePassword_click(object sender, RoutedEventArgs e)
    {
      string currentPassword = txtCurrentPassword.Password.Trim();
      string newPassword = pwNewPassword.Password.Trim();
      string confirmPw = pwConfirm.Password.Trim();

      if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword) || string.IsNullOrWhiteSpace(confirmPw))
      {
        _ = MessageBox.Show("Vui lòng nhập đầy đủ thông tin.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      if (!confirmPw.Equals(newPassword))
      {
        _ = MessageBox.Show("Mật khẩu xác nhận không khớp.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        return;
      }

      try
      {
        if (App.CurrentUser != null)
        {
          await _accountService.RequestPasswordReset(App.CurrentUser.Email, newPassword, currentPassword);
          _ = MessageBox.Show("Cập nhật mật khẩu mới thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
          DialogResult = true;
        }
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show(ex.Message, "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private void btnBack_Click(object sender, RoutedEventArgs e)
    {
      DialogResult = false;
    }
  }
}
