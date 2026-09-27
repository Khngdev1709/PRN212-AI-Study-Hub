using System.Windows;
using System.Windows.Controls;

namespace Prn212.AIStudyHub.WPF.Views.Auth
{
  /// <summary>
  /// Màn hình Quản lý người dùng dành riêng cho Admin.
  /// Hiển thị danh sách sinh viên và cho phép khóa/mở khóa tài khoản.
  /// </summary>
  public partial class ManageUsersWindow : Window
  {
    private readonly AdminService _adminService = new();

    public ManageUsersWindow()
    {
      InitializeComponent();
      Loaded += ManageUsersWindow_Loaded;
    }

    private async void ManageUsersWindow_Loaded(object sender, RoutedEventArgs e)
    {
      await LoadUsersAsync();
    }

    private async Task LoadUsersAsync()
    {
      try
      {
        var students = await _adminService.GetStudentsAsync();
        dgUsers.ItemsSource = students;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi tải danh sách người dùng: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private async void BtnToggleStatus_Click(object sender, RoutedEventArgs e)
    {
      if (sender is Button btn && btn.DataContext is AppUser selectedUser)
      {
        try
        {
          string action = selectedUser.IsActive ? "khóa" : "mở khóa";
          var confirm = MessageBox.Show($"Bạn có chắc chắn muốn {action} tài khoản của {selectedUser.LastName} {selectedUser.FirstName} không?",
                                        "Xác nhận", MessageBoxButton.YesNo, MessageBoxImage.Question);

          if (confirm == MessageBoxResult.Yes)
          {
            _adminService.ToggleUserStatus(selectedUser.Id);
            _ = MessageBox.Show($"Đã {action} tài khoản thành công.", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
            await LoadUsersAsync();
          }
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Lỗi khi thay đổi trạng thái: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        }
      }
    }
  }
}
