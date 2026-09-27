using System.Windows;

namespace Prn212.AIStudyHub.WPF.Views.Account
{
  /// <summary>
  /// Interaction logic for UpdateProfileWindow.xaml
  /// </summary>
  public partial class UpdateProfileWindow : Window
  {
    private readonly AccountService _accountService = new();
    public UpdateProfileWindow()
    {
      InitializeComponent();
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
      if (App.CurrentUser == null)
      {
        _ = MessageBox.Show("Không tìm thấy thông tin tài khoản đang đăng nhập!", "Lỗi xác thực", MessageBoxButton.OK, MessageBoxImage.Error);
        Close();
        return;
      }
      await LoadAccountProfile();
    }

    private async Task LoadAccountProfile()
    {
      try
      {
        if (App.CurrentUser == null)
        {
          return;
        }

        AppUser user = await _accountService.GetCurrentUser(App.CurrentUser.Email);
        txtFullName.Text = $"{user.FirstName} {user.LastName}";
        txtEmail.Text = user.Email;
        txtFirstName.Text = user.FirstName;
        txtLastName.Text = user.LastName;
        txtCreatedAt.Text = user.CreatedAt.ToString("dd/MM/yyyy");
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi tải hồ sơ: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        Close();
      }
    }
    private async void btnUpdateProfile_Click(object sender, RoutedEventArgs e)
    {
      if (App.CurrentUser == null)
      {
        return;
      }

      try
      {
        var email = txtEmail.Text.Trim();
        var firstName = txtFirstName.Text.Trim();
        var lastName = txtLastName.Text.Trim();

        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
        {
          _ = MessageBox.Show("Họ và tên không được để trống.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
          return;
        }

        await _accountService.UpdateProfile(email, firstName, lastName);

        // Refresh local session (C3)
        App.CurrentUser = await _accountService.GetCurrentUser(email);

        _ = MessageBox.Show("Cập nhật thông tin thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        await LoadAccountProfile();
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi cập nhật: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private void btnBack_click(object sender, RoutedEventArgs e)
    {
      Close();
    }
  }
}
