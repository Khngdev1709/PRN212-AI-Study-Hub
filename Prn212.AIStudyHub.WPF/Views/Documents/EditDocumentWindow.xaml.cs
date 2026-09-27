using System.Windows;
using System.Windows.Controls;

namespace Prn212.AIStudyHub.WPF.Views.Documents
{
  public partial class EditDocumentWindow : Window
  {
    private readonly DocumentService _documentService = new();
    private readonly int? _initialDocumentId;
    private Document? _originalDocument;
    private bool _hasUnsavedChanges = false;
    private bool _isDataLoading = false;
    private int? _previousSelectedDocId = null;

    public EditDocumentWindow(int? initialDocumentId = null)
    {
      InitializeComponent();
      _initialDocumentId = initialDocumentId;

      Loaded += EditDocumentWindow_Loaded;

      if (_initialDocumentId.HasValue)
      {
        spDocSelection.Visibility = Visibility.Collapsed;
      }
    }

    private async void EditDocumentWindow_Loaded(object sender, RoutedEventArgs e)
    {
      await LoadSubjectsAsync();
      await LoadDocumentsAsync();

      if (_initialDocumentId.HasValue)
      {
        cbDocuments.SelectedValue = _initialDocumentId.Value;
      }
    }

    private async Task LoadSubjectsAsync()
    {
      try
      {
        var subjects = await _documentService.GetAllSubjectsAsync();
        cbSubject.ItemsSource = subjects;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi tải danh sách môn học: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private async Task LoadDocumentsAsync()
    {
      try
      {
        var result = await _documentService.SearchDocumentsAsync(page: 1, pageSize: 100);
        cbDocuments.ItemsSource = result.Items;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Lỗi tải danh sách tài liệu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
    }

    private async void CbDocuments_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      if (_isDataLoading)
      {
        return;
      }

      if (_hasUnsavedChanges && _previousSelectedDocId.HasValue)
      {
        var discardConfirm = MessageBox.Show(
            "Bạn có thay đổi chưa lưu cho tài liệu hiện tại. Bạn có muốn bỏ qua và chuyển sang tài liệu khác không?",
            "Xác nhận chuyển tài liệu",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (discardConfirm != MessageBoxResult.Yes)
        {
          _isDataLoading = true;
          cbDocuments.SelectedValue = _previousSelectedDocId.Value;
          _isDataLoading = false;
          return;
        }
      }

      if (cbDocuments.SelectedItem is Document selectedDoc)
      {
        _isDataLoading = true;
        try
        {
          _originalDocument = await _documentService.GetDetailAsync(selectedDoc.Id);
          if (_originalDocument != null)
          {
            txtTitle.Text = _originalDocument.Title;
            cbSubject.SelectedValue = _originalDocument.SubjectId;

            // Kiểm tra quyền sở hữu (IDOR UI safety check)
            bool isOwner = App.CurrentUser != null && _originalDocument.UserId == App.CurrentUser.Id;
            txtTitle.IsEnabled = isOwner;
            cbSubject.IsEnabled = isOwner;
            btnSave.IsEnabled = isOwner;
            if (!isOwner)
            {
              txtTitle.ToolTip = "Bạn không có quyền chỉnh sửa tài liệu này vì bạn không phải người tải lên.";
              cbSubject.ToolTip = "Bạn không có quyền chỉnh sửa tài liệu này vì bạn không phải người tải lên.";
              btnSave.ToolTip = "Bạn không có quyền chỉnh sửa tài liệu này vì bạn không phải người tải lên.";
            }
            else
            {
              txtTitle.ToolTip = null;
              cbSubject.ToolTip = null;
              btnSave.ToolTip = null;
            }
          }
          _previousSelectedDocId = selectedDoc.Id;
        }
        catch (Exception ex)
        {
          _ = MessageBox.Show($"Lỗi khi tải chi tiết tài liệu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
          _isDataLoading = false;
          _hasUnsavedChanges = false;
        }
      }
      else
      {
        _originalDocument = null;
        txtTitle.Text = string.Empty;
        cbSubject.SelectedIndex = -1;
        _previousSelectedDocId = null;
        _hasUnsavedChanges = false;
      }
    }

    private void TxtTitle_TextChanged(object sender, TextChangedEventArgs e)
    {
      CheckForChanges();
    }

    private void CbSubject_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      CheckForChanges();
    }

    private void CheckForChanges()
    {
      if (_isDataLoading || _originalDocument == null)
      {
        return;
      }

      bool titleChanged = txtTitle.Text.Trim() != (_originalDocument.Title ?? string.Empty).Trim();
      bool subjectChanged = cbSubject.SelectedValue is int subId && subId != _originalDocument.SubjectId;

      _hasUnsavedChanges = titleChanged || subjectChanged;
    }

    protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
    {
      if (_hasUnsavedChanges)
      {
        var result = MessageBox.Show(
            "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát và bỏ qua các thay đổi này không?",
            "Xác nhận thoát",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (result != MessageBoxResult.Yes)
        {
          e.Cancel = true;
          return;
        }
      }
      base.OnClosing(e);
    }

    private async void BtnSave_Click(object sender, RoutedEventArgs e)
    {
      if (cbDocuments.SelectedItem is not Document selectedDoc || _originalDocument == null)
      {
        _ = MessageBox.Show("Vui lòng chọn tài liệu cần chỉnh sửa!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      string newTitle = txtTitle.Text.Trim();
      if (string.IsNullOrWhiteSpace(newTitle))
      {
        _ = MessageBox.Show("Tiêu đề tài liệu không được để trống!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        _ = txtTitle.Focus();
        return;
      }

      if (cbSubject.SelectedValue is not int selectedSubjectId)
      {
        _ = MessageBox.Show("Vui lòng chọn môn học cho tài liệu!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
        return;
      }

      if (!_hasUnsavedChanges)
      {
        _ = MessageBox.Show("Không có sự thay đổi nào so với dữ liệu gốc để lưu.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        return;
      }

      var confirm = MessageBox.Show(
          $"Bạn có chắc chắn muốn lưu các thay đổi cho tài liệu '{_originalDocument.Title}' không?",
          "Xác nhận cập nhật",
          MessageBoxButton.YesNo,
          MessageBoxImage.Question);

      if (confirm != MessageBoxResult.Yes)
      {
        return;
      }

      if (App.CurrentUser == null)
      {
        _ = MessageBox.Show("Không tìm thấy thông tin tài khoản đăng nhập!", "Lỗi xác thực", MessageBoxButton.OK, MessageBoxImage.Error);
        return;
      }

      try
      {
        btnSave.IsEnabled = false;

        await _documentService.UpdateMetadataAsync(selectedDoc.Id, newTitle, selectedSubjectId, App.CurrentUser.Id);

        // Hiệu ứng thành công trên nút bấm
        btnSave.Content = "Đã lưu! ✔";
        var originalBackground = btnSave.Background;
        btnSave.Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Colors.Green);

        // Reset change tracking
        _hasUnsavedChanges = false;
        _originalDocument = await _documentService.GetDetailAsync(selectedDoc.Id);

        // Nạp lại danh sách tài liệu
        _isDataLoading = true;
        await LoadDocumentsAsync();
        cbDocuments.SelectedValue = selectedDoc.Id;
        _isDataLoading = false;

        await Task.Delay(2000);

        btnSave.Content = "Lưu Thay Đổi";
        btnSave.Background = originalBackground;
      }
      catch (Exception ex)
      {
        _ = MessageBox.Show($"Cập nhật thất bại: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
      }
      finally
      {
        btnSave.IsEnabled = true;
      }
    }

    private void BtnCancel_Click(object sender, RoutedEventArgs e)
    {
      Close();
    }
  }
}
