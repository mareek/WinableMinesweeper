using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Text;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace WinableMinesweeper
{
    public sealed partial class MineFieldCell : UserControl
    {
        public MineFieldCell()
        {
            this.InitializeComponent();
        }

        public MineFieldCell(int row, int col)
            : this()
        {
            Row = row;
            Col = col;

            CellTextBlock.Text = $"{row}-{col}";
        }

        public int Row { get; }
        public int Col { get; }

        private void UserControl_Tapped(object sender, TappedRoutedEventArgs e)
        {
            CellTextBlock.FontWeight = (CellTextBlock.FontWeight.Weight == FontWeights.Bold.Weight) ? FontWeights.Normal : FontWeights.Bold;
        }

        private void UserControl_RightTapped(object sender, RightTappedRoutedEventArgs e)
        {
            CellTextBlock.FontStyle = (CellTextBlock.FontStyle == FontStyle.Italic) ? FontStyle.Normal : FontStyle.Italic;
        }
    }
}
