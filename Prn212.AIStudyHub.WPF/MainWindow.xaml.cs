using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;

using Microsoft.Win32;

using Prn212.AIStudyHub.WPF.Views.Account;
using Prn212.AIStudyHub.WPF.Views.Auth;
using Prn212.AIStudyHub.WPF.Views.Documents;

namespace Prn212.AIStudyHub.WPF
{
  /// <summary>
  /// Trang chủ sau khi đăng nhập: hiển thị danh sách tài liệu, tìm/lọc/sắp xếp,
  /// mở màn hình upload, chi tiết, tải xuống, sửa, xóa, và cập nhật thông tin cá nhân.
  /// </summary>
  public partial class MainWindow : Window
  {
    private readonly DocumentService _documentService = new();
    private bool _initialized;
    private readonly DispatcherTimer _debounceTimer;

    public MainWindow()
    {
      InitializeComponent();
      Loaded += MainWindow_Loaded;

      _debounceTimer = new DispatcherTimer
      {
        Interval = TimeSpan.FromMilliseconds(300)
      };
      _debounceTimer.Tick += DebounceTimer_Tick;
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
      UpdateWelcomeHeader();
      await LoadSubjectFilterAsync();
      _initialized = true;
      await LoadDocumentsAsync();
    }

    private void UpdateWelcomeHeader()
    {
      if (App.CurrentUser != null)
      {
        txtWelcome.Text = $"Xin chào, {App.CurrentUser.LastName} {App.CurrentUser.FirstName}";
        txtProfileButtonText.Text = $" {App.CurrentUser.FirstName}";
        txtProfileName.Text = $"{App.CurrentUser.LastName} {App.CurrentUser.FirstName}";
        txtProfileEmail.Text = App.CurrentUser.Email;

        // Hiện nút Quản lý người dùng nếu là Admin
        if (App.CurrentUser.Role == "Admin")
        {
          btnManageUsers.Visibility = Visibility.Visible;
        }
      }
    }

    private async Task LoadSubjectFilterAsync()
    {
      var subjects = await _documentService.GetAllSubjectsAsync();
      subjects.Insert(0, new Subject { Id = -1, Name = "-- Tất cả môn --" });
      cbSubjectFilter.ItemsSource = subjects;
      cbSubjectFilter.SelectedIndex = 0;
    }

    private async Task LoadDocumentsAsync()
    {
      try
      {
        string? keyword = string.IsNullOrWhiteSpace(txtSearch.Text) ? null : txtSearch.Text.Trim();

        int? subjectId = null;
        if (cbSubjectFilter.SelectedItem is Subject selectedSubject && selectedSubject.Id != -1)
        {
          subjectId = selectedSubject.Id;
        }

        string? sortBy = (cbSort.SelectedItem as ComboBoxItem)?.Tag?.ToString();

        int? userId = null;
        if (cbMyDocs?.IsChecked == true && App.CurrentUser != null)
        {
          userId = App.CurrentUser.Id;
        }

        // Tìm kiếm trên: Title, Subject Name, Subject Description
        var (items, total) = await _documentService.SearchDocumentsAsync(keyword, subjectId, userId, 1, 200, sortBy);
        dgDocuments.ItemsSource = items;

        tbEmptyState.Visibility = items == null || items.Count == 0 ? Visibility.Visible : Visibility.Collapsed;

        // Hiển thị trạng thái tìm kiếm
        string searchStatus = string.IsNullOrWhiteSpace(keyword)
            ? $"Hiển thị {items?.Count ?? 0} / tổng {total} tài liệu."
            : $"Hiển thị {items?.Count ?? 0} / tìm thấy {total} kết quả cho '{keyword}'.";
        txtStatus.Text = searchStatus;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi tải danh sách tài liệu:\n{ex.Message}",
                        "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private async void Filter_Changed(object sender, RoutedEventArgs e)
    {
      if (_initialized)
      {
        await LoadDocumentsAsync();
      }
    }

    private async void TxtSearch_KeyDown(object sender, KeyEventArgs e)
    {
      if (e.Key == Key.Enter)
      {
        _debounceTimer.Stop();
        await LoadDocumentsAsync();
      }
    }

    /// <summary>
    /// Real-time search với debounce 300ms
    /// Khi user gõ: delay 300ms trước khi search
    /// Nếu user gõ tiếp: reset timer
    /// Khi user dừng gõ 300ms: trigger search
    /// </summary>
    private void TxtSearch_TextChanged(object sender, TextChangedEventArgs e)
    {
      _debounceTimer.Stop();
      _debounceTimer.Start();
    }

    private async void DebounceTimer_Tick(object? sender, EventArgs e)
    {
      _debounceTimer.Stop();
      await LoadDocumentsAsync();
    }

    private async void BtnUpload_Click(object sender, RoutedEventArgs e)
    {
      UploadDocumentWindow uploadWindow = new UploadDocumentWindow { Owner = this };
      _ = uploadWindow.ShowDialog();

      if (uploadWindow.SubjectAdded)
      {
        await LoadSubjectFilterAsync();
      }
      await LoadDocumentsAsync(); // làm mới danh sách sau khi upload xong
    }

    private void BtnLogout_Click(object sender, RoutedEventArgs e)
    {
      var confirm = MessageBox.Show("Bạn có chắc muốn đăng xuất?", "Xác nhận đăng xuất",
                                    MessageBoxButton.YesNo, MessageBoxImage.Question);
      if (confirm != MessageBoxResult.Yes)
      {
        return;
      }

      App.CurrentUser = null;        // xóa session
      LoginWindow login = new LoginWindow();
      login.Show();                  // mở lại màn hình đăng nhập trước
      Close();                  // rồi đóng trang chủ
    }

    private async Task OpenViewDocumentWindowAsync(Document selectedDoc)
    {
      ViewDocumentWindow viewWindow = new ViewDocumentWindow(selectedDoc.Id) { Owner = this };
      _ = viewWindow.ShowDialog();
      await LoadDocumentsAsync(); // Tải lại danh sách sau khi quay về
    }

    private async void BtnOpenDetail_Click(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is Document selectedDoc)
      {
        await OpenViewDocumentWindowAsync(selectedDoc);
      }
    }

    private async void DgDocuments_MouseDoubleClick(object sender, MouseButtonEventArgs e)
    {
      if (dgDocuments.SelectedItem is Document selectedDoc)
      {
        await OpenViewDocumentWindowAsync(selectedDoc);
      }
    }

    private void DataGridRow_PreviewMouseRightButtonDown(object sender, MouseButtonEventArgs e)
    {
      if (sender is DataGridRow row)
      {
        row.IsSelected = true;
        _ = row.Focus();
      }
    }

    private async void MenuItemDownload_Click(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is not Document selectedDoc)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần tải!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      SaveFileDialog saveDialog = new Microsoft.Win32.SaveFileDialog
      {
        FileName = selectedDoc.FileName,
        Filter = $"Tệp tin (*{selectedDoc.FileExtension})|*{selectedDoc.FileExtension}|Tất cả các tệp (*.*)|*.*",
        InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Desktop)
      };

      if (saveDialog.ShowDialog() == true)
      {
        string destPath = saveDialog.FileName;
        try
        {
          txtStatus.Text = $"Đang tải xuống '{selectedDoc.Title}'...";
          await _documentService.DownloadAsync(selectedDoc.Id, destPath);
          _ = MessageBox.Show("Tải xuống tài liệu thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Lỗi khi tải xuống: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
          await LoadDocumentsAsync();
        }
      }
    }


    private async void MenuItemDelete_Click(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is not Document selectedDoc)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần xóa!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      var result = MessageBox.Show(
          $"Bạn có chắc chắn muốn xóa tài liệu '{selectedDoc.Title}' không?\nHành động này không thể hoàn tác.",
          "Xác nhận xóa tài liệu",
          MessageBoxButton.YesNo,
          MessageBoxImage.Warning);

      if (result == MessageBoxResult.Yes)
      {
        if (App.CurrentUser == null)
        {
          _ = MessageBox.Show("Không tìm thấy thông tin tài khoản đăng nhập!", "Lỗi xác thực", MessageBoxButton.OK, MessageBoxImage.Error);
          return;
        }

        try
        {
          txtStatus.Text = $"Đang xóa tài liệu '{selectedDoc.Title}'...";
          await _documentService.DeleteAsync(selectedDoc.Id, App.CurrentUser.Id);
          _ = MessageBox.Show("Xóa tài liệu thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Xóa thất bại: {ex.Message}", "Lỗi hệ thống", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
          await LoadDocumentsAsync();
        }
      }
    }

    private async void BtnOpenEdit_Click(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is Document selectedDoc)
      {
        EditDocumentWindow editWindow = new EditDocumentWindow(selectedDoc.Id) { Owner = this };
        _ = editWindow.ShowDialog();
        await LoadDocumentsAsync();
      }
    }

    private void MenuItemPreview_Click(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is Document selectedDoc)
      {
        PreviewDocumentWindow previewWindow = new PreviewDocumentWindow(selectedDoc) { Owner = this };
        _ = previewWindow.ShowDialog();
      }
    }

    private async void BtnRowDetail_Click(object sender, RoutedEventArgs e)
    {
      if (sender is Button btn && btn.DataContext is Document selectedDoc)
      {
        await OpenViewDocumentWindowAsync(selectedDoc);
      }
    }

    private void btnUpdateProfile_Click(object sender, RoutedEventArgs e)
    {
      UpdateProfileWindow updateWindow = new Views.Account.UpdateProfileWindow
      {
        Owner = this
      };
      _ = updateWindow.ShowDialog();
      UpdateWelcomeHeader();
    }

    private void btnProfile_Click(object sender, RoutedEventArgs e)
    {
      ProfilePopup.IsOpen = !ProfilePopup.IsOpen;
    }

    private void btnResetPassword_Click(object sender, RoutedEventArgs e)
    {
      ResetPasswordWindow resetPwWindow = new Views.Account.ResetPasswordWindow { Owner = this };
      _ = resetPwWindow.ShowDialog();
    }

    private void ContextMenu_Opened(object sender, RoutedEventArgs e)
    {
      if (dgDocuments.SelectedItem is Document selectedDoc && App.CurrentUser != null)
      {
        bool isOwner = selectedDoc.UserId == App.CurrentUser.Id;
        if (sender is ContextMenu menu)
        {
          foreach (var item in menu.Items)
          {
            if (item is MenuItem mi)
            {
              string header = mi.Header?.ToString() ?? string.Empty;
              if (header is "Chỉnh sửa" or "Xóa")
              {
                mi.Visibility = isOwner ? Visibility.Visible : Visibility.Collapsed;
              }
            }
            else if (item is Separator sep)
            {
              sep.Visibility = isOwner ? Visibility.Visible : Visibility.Collapsed;
            }
          }
        }
      }
    }

    private void BtnManageUsers_Click(object sender, RoutedEventArgs e)
    {
      ManageUsersWindow manageUsersWindow = new ManageUsersWindow { Owner = this };
      _ = manageUsersWindow.ShowDialog();
    }
  }
}
