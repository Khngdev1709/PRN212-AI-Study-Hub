using System.IO;
using System.Windows;

using Microsoft.Win32;

namespace Prn212.AIStudyHub.WPF.Views.Documents
{
  /// <summary>
  /// Giao diện tải lên tài liệu và thêm môn học.
  /// </summary>
  public partial class UploadDocumentWindow : Window
  {
    private readonly DocumentService _documentService = new();
    private string _selectedFilePath = string.Empty;
    public bool SubjectAdded { get; private set; } = false;

    public UploadDocumentWindow()
    {
      InitializeComponent();
      Loaded += UploadDocumentWindow_Loaded;
    }

    private async void UploadDocumentWindow_Loaded(object sender, RoutedEventArgs e)
    {
      try
      {
        await LoadComboBoxDataAsync();

        // Show Admin tab if current user is Admin
        if (App.CurrentUser?.Role == "Admin")
        {
          tabAddSubject.Visibility = Visibility.Visible;
        }
        else
        {
          // Fully remove or collapse the tab for non-admins
          tabAddSubject.Visibility = Visibility.Collapsed;
        }
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi tải dữ liệu khởi tạo:\n{ex.Message}",
                        "Lỗi kết nối", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private async Task LoadComboBoxDataAsync()
    {
      var subjects = await _documentService.GetAllSubjectsAsync();
      cbSubject.ItemsSource = subjects;
      if (subjects.Any())
      {
        cbSubject.SelectedIndex = 0;
      }

      txtUserDisplayName.Text = App.CurrentUser != null
        ? $"{App.CurrentUser.LastName} {App.CurrentUser.FirstName} ({App.CurrentUser.Email})"
        : "Chưa có thông tin tài khoản đang đăng nhập";
    }

    private void BtnBrowse_Click(object sender, RoutedEventArgs e)
    {
      OpenFileDialog openFileDialog = new OpenFileDialog
      {
        Title = "Chọn tệp tài liệu học tập",
        Filter = "Tài liệu học tập (*.pdf;*.docx;*.xlsx;*.pptx;*.txt;*.md)|*.pdf;*.docx;*.xlsx;*.pptx;*.txt;*.md"
      };

      if (openFileDialog.ShowDialog() == true)
      {
        _selectedFilePath = openFileDialog.FileName;
        FileInfo fileInfo = new FileInfo(_selectedFilePath);
        double fileSizeInMb = (double)fileInfo.Length / (1024 * 1024);

        lblFileName.Text = $"{fileInfo.Name} ({fileSizeInMb:F2} MB)";
        lblFileName.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Colors.DarkGreen);

        if (string.IsNullOrWhiteSpace(txtTitle.Text))
        {
          txtTitle.Text = Path.GetFileNameWithoutExtension(fileInfo.Name);
        }
      }
    }

    private async void BtnUpload_Click(object sender, RoutedEventArgs e)
    {
      if (string.IsNullOrWhiteSpace(txtTitle.Text))
      {
        _ = MessageBox.Show("Vui lòng nhập tiêu đề cho tài liệu!", "Dữ liệu không hợp lệ", MessageBoxButton.OK, MessageBoxImage.Warning);
        _ = txtTitle.Focus();
        return;
      }
      if (cbSubject.SelectedValue == null)
      {
        _ = MessageBox.Show("Vui lòng chọn môn học liên quan!", "Dữ liệu không hợp lệ", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }
      if (App.CurrentUser == null)
      {
        _ = MessageBox.Show("Không tìm thấy thông tin tài khoản đăng nhập!", "Lỗi xác thực", MessageBoxButton.OK, MessageBoxImage.Error);
        return;
      }
      if (string.IsNullOrEmpty(_selectedFilePath) || !File.Exists(_selectedFilePath))
      {
        _ = MessageBox.Show("Vui lòng chọn một tệp tin hợp lệ!", "Dữ liệu không hợp lệ", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      try
      {
        SetUiEnabledState(false);

        await _documentService.UploadAsync(
            App.CurrentUser.Id,
            (int)cbSubject.SelectedValue,
            txtTitle.Text.Trim(),
            _selectedFilePath,
            chkUploadToCloud.IsChecked == true);

        _ = MessageBox.Show("Tải tài liệu lên và lưu thông tin thành công!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
        DialogResult = true;
        Close();
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Đã xảy ra lỗi trong quá trình upload tài liệu:\n{ex.Message}", "Lỗi upload", MessageBoxButton.OK, MessageBoxImage.Error);
        SetUiEnabledState(true);
      }
    }

    private async void BtnSaveSubject_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        string name = txtSubjectName.Text.Trim();
        string description = txtSubjectDescription.Text.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
          _ = MessageBox.Show("Vui lòng nhập tên môn học.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
          return;
        }

        btnSaveSubject.IsEnabled = false;
        await _documentService.AddSubjectAsync(name, description);

        _ = MessageBox.Show("Thêm môn học thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        SubjectAdded = true;

        // Reload subjects in tab 1
        await LoadComboBoxDataAsync();

        // Clear inputs
        txtSubjectName.Text = string.Empty;
        txtSubjectDescription.Text = string.Empty;

        // Switch back to Tab 1
        tabControl.SelectedIndex = 0;
        btnSaveSubject.IsEnabled = true;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        btnSaveSubject.IsEnabled = true;
      }
    }

    private void SetUiEnabledState(bool isEnabled)
    {
      txtTitle.IsEnabled = isEnabled;
      cbSubject.IsEnabled = isEnabled;
      txtUserDisplayName.IsEnabled = isEnabled;
      btnBrowse.IsEnabled = isEnabled;
      btnUpload.IsEnabled = isEnabled;
      btnCancel.IsEnabled = isEnabled;
      chkUploadToCloud.IsEnabled = isEnabled;
      spProgress.Visibility = isEnabled ? Visibility.Collapsed : Visibility.Visible;
    }

    private void BtnCancel_Click(object sender, RoutedEventArgs e)
    {
      Close();
    }
  }
}
