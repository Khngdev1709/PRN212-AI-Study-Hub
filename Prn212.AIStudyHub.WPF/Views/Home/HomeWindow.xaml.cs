using System.Windows;
using System.Windows.Input;

using Prn212.AIStudyHub.WPF.Views.Auth;

namespace Prn212.AIStudyHub.WPF.Views.Home
{
  public partial class HomeWindow : Window
  {
    public HomeWindow()
    {
      InitializeComponent();
    }

    private void BtnGetStarted_Click(object sender, RoutedEventArgs e)
    {
      LoginWindow loginWindow = new LoginWindow();
      loginWindow.Show();
      Close();
    }

    private void LnkRegister_Click(object sender, MouseButtonEventArgs e)
    {
      LoginWindow loginWindow = new LoginWindow();
      loginWindow.Show();

      RegisterWindow registerWindow = new RegisterWindow { Owner = loginWindow };
      _ = registerWindow.ShowDialog();

      Close();
    }
  }
}
