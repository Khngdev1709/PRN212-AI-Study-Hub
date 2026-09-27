using System.Windows;

using Microsoft.Win32;

using Prn212.AIStudyHub.WPF.Helpers;

namespace Prn212.AIStudyHub.WPF.Views.Documents
{
  /// <summary>
  /// Xem chi tiết tài liệu: hiển thị thông tin, download, edit, delete.
  /// NGƯỜI DOC làm ở file này để tích hợp vào DocumentListWindow sau.
  /// </summary>
  public partial class ViewDocumentWindow : Window
  {
    private readonly DocumentService _documentService = new();
    private Document? _currentDocument;
    private readonly int? _initialDocumentId;

    public ViewDocumentWindow(int? selectedDocumentId = null)
    {
      InitializeComponent();
      _initialDocumentId = selectedDocumentId;
      Loaded += ViewDocumentWindow_Loaded;
    }

    private async void ViewDocumentWindow_Loaded(object sender, RoutedEventArgs e)
    {
      try
      {
        if (_initialDocumentId.HasValue)
        {
          await LoadDocumentDetailAsync(_initialDocumentId.Value);
        }
        else
        {
          _ = MessageBox.Show("Vui lòng chọn tài liệu trước khi xem chi tiết.",
                          "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
          Close();
        }
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi tải dữ liệu:\n{ex.Message}",
                        "Lỗi tải dữ liệu", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    /// <summary>
    /// Tải chi tiết tài liệu từ database và hiển thị
    /// </summary>
    private async Task LoadDocumentDetailAsync(int documentId)
    {
      try
      {
        var doc = await _documentService.GetDetailAsync(documentId);
        if (doc == null)
        {
          _ = MessageBox.Show("Tài liệu không tồn tại trên hệ thống.",
                          "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
          ClearDocumentDetail();
          return;
        }

        _currentDocument = doc;

        // Hiển thị thông tin chi tiết
        txtTitle.Text = doc.Title ?? "N/A";
        txtFileName.Text = doc.FileName ?? "N/A";
        txtFileSize.Text = DocumentDisplayHelper.FormatFileSize(doc.FileSize);
        txtFileExtension.Text = doc.FileExtension ?? "N/A";
        txtUploadedDate.Text = doc.UploadedAt.ToString("dd/MM/yyyy HH:mm:ss");
        txtSubject.Text = doc.Subject?.Name ?? "N/A";
        txtContentType.Text = doc.ContentType ?? "N/A";

        // Thiết lập icon tệp tin tương ứng
        txtFileIcon.Text = DocumentDisplayHelper.GetFileIcon(doc.FileExtension);

        // Hiển thị thông tin tác giả
        string authorName = $"{doc.User?.FirstName} {doc.User?.LastName}".Trim();
        string authorEmail = doc.User?.Email ?? "N/A";
        txtAuthor.Text = $"{authorName} ({authorEmail})";

        // Enable action buttons
        btnDownload.IsEnabled = true;
        btnPreview.IsEnabled = true;

        bool isOwner = App.CurrentUser != null && doc.UserId == App.CurrentUser.Id;
        btnEdit.Visibility = isOwner ? Visibility.Visible : Visibility.Collapsed;
        btnDelete.Visibility = isOwner ? Visibility.Visible : Visibility.Collapsed;
        btnEdit.IsEnabled = isOwner;
        btnDelete.IsEnabled = isOwner;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi tải chi tiết tài liệu:\n{ex.Message}",
                        "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        ClearDocumentDetail();
      }
    }

    /// <summary>
    /// Xóa sạch thông tin chi tiết tài liệu khỏi giao diện
    /// </summary>
    private void ClearDocumentDetail()
    {
      _currentDocument = null;
      txtTitle.Text = string.Empty;
      txtFileName.Text = string.Empty;
      txtFileSize.Text = string.Empty;
      txtFileExtension.Text = string.Empty;
      txtUploadedDate.Text = string.Empty;
      txtSubject.Text = string.Empty;
      txtContentType.Text = string.Empty;
      txtAuthor.Text = string.Empty;
      txtFileIcon.Text = "📁";

      btnDownload.IsEnabled = false;
      btnPreview.IsEnabled = false;
      btnEdit.Visibility = Visibility.Collapsed;
      btnDelete.Visibility = Visibility.Collapsed;
    }

    /// <summary>
    /// Nút Download: Mở dialog lưu file, rồi gọi DownloadAsync từ service
    /// </summary>
    private async void BtnDownload_Click(object sender, RoutedEventArgs e)
    {
      if (_currentDocument == null)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần tải xuống!",
                        "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      // Mở dialog chọn nơi lưu file
      SaveFileDialog saveDialog = new SaveFileDialog
      {
        FileName = _currentDocument.FileName,
        Filter = $"Tệp tin (*{_currentDocument.FileExtension})|*{_currentDocument.FileExtension}|Tất cả tệp tin (*.*)|*.*",
        InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Desktop)
      };

      if (saveDialog.ShowDialog() == true)
      {
        string destPath = saveDialog.FileName;

        // Tạo progress callback để cập nhật trực tiếp trên nhãn nút
        Progress<double> progress = new Progress<double>(percent =>
        {
          btnDownload.Content = $"Đang tải: {percent:F0}%";
        });

        var originalBackground = btnDownload.Background;
        string originalContent = btnDownload.Content.ToString() ?? "⬇ Tải Xuống";

        try
        {
          // Vô hiệu hóa các nút hành động trong khi tải xuống
          btnDownload.IsEnabled = false;
          btnEdit.IsEnabled = false;
          btnDelete.IsEnabled = false;

          // Gọi service để download
          await _documentService.DownloadAsync(_currentDocument.Id, destPath, progress);

          // Cập nhật nhãn nút thành màu xanh lá hiển thị thành công
          btnDownload.Content = "Tải thành công! ✔";
          btnDownload.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Colors.Green);

          _ = MessageBox.Show($"Tải xuống tài liệu thành công!\nĐường dẫn: {destPath}",
                          "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);

          // Hiển thị nhãn thành công trong 2 giây
          await Task.Delay(2000);
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Lỗi khi tải xuống tài liệu:\n{ex.Message}",
                          "Lỗi tải xuống", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
          // Khôi phục lại trạng thái ban đầu của các nút bấm
          btnDownload.Content = originalContent;
          btnDownload.Background = originalBackground;
          btnDownload.IsEnabled = true;
          btnEdit.IsEnabled = true;
          btnDelete.IsEnabled = true;
        }
      }
    }

    /// <summary>
    /// Nút Edit: Mở cửa sổ EditDocumentWindow để sửa metadata
    /// </summary>
    private async void BtnEdit_Click(object sender, RoutedEventArgs e)
    {
      if (_currentDocument == null)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần chỉnh sửa!",
                        "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      try
      {
        // Mở EditDocumentWindow
        EditDocumentWindow editWindow = new EditDocumentWindow(_currentDocument.Id)
        {
          Owner = this
        };
        _ = editWindow.ShowDialog();

        // Sau khi sửa xong, tải lại chi tiết tài liệu
        await LoadDocumentDetailAsync(_currentDocument.Id);
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi khi mở cửa sổ sửa:\n{ex.Message}",
                        "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    /// <summary>
    /// Nút Delete: Xóa tài liệu (xóa database + xóa file vật lý)
    /// </summary>
    private async void BtnDelete_Click(object sender, RoutedEventArgs e)
    {
      if (_currentDocument == null)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần xóa!",
                        "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      // Xác nhận xóa
      var result = MessageBox.Show(
          $"Bạn có chắc chắn muốn xóa tài liệu:\n\"{_currentDocument.Title}\"?\n\n" +
          "Hành động này sẽ xóa dữ liệu từ database và file vật lý trên server.\n" +
          "Không thể hoàn tác!",
          "Xác nhận xóa tài liệu",
          MessageBoxButton.YesNo,
          MessageBoxImage.Warning);

      if (result == MessageBoxResult.Yes)
      {
        try
        {
          btnDownload.IsEnabled = false;
          btnEdit.IsEnabled = false;
          btnDelete.IsEnabled = false;

          if (App.CurrentUser == null)
          {
            _ = MessageBox.Show("Không tìm thấy thông tin tài khoản đăng nhập!", "Lỗi xác thực", MessageBoxButton.OK, MessageBoxImage.Error);
            return;
          }

          // Gọi service để xóa
          await _documentService.DeleteAsync(_currentDocument.Id, App.CurrentUser.Id);

          _ = MessageBox.Show("Xóa tài liệu thành công!",
                          "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);

          // Đóng cửa sổ vì tài liệu đã bị xóa thành công
          Close();
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Lỗi khi xóa tài liệu:\n{ex.Message}",
                          "Lỗi xóa", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
          btnDownload.IsEnabled = _currentDocument != null;
          btnEdit.IsEnabled = _currentDocument != null;
          btnDelete.IsEnabled = _currentDocument != null;
        }
      }
    }



    private void BtnPreview_Click(object sender, RoutedEventArgs e)
    {
      if (_currentDocument != null)
      {
        PreviewDocumentWindow previewWindow = new PreviewDocumentWindow(_currentDocument) { Owner = this };
        _ = previewWindow.ShowDialog();
      }
    }
  }
}
