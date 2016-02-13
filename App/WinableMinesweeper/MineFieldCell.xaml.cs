using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
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
        private readonly Func<MineFieldCell, Task> _leftClick;
        private readonly Func<MineFieldCell, Task> _rightClick;

        public MineFieldCell()
        {
            this.InitializeComponent();
        }

        public MineFieldCell(int row, int col, MineCell mineCell, Func<MineFieldCell, Task> leftClick, Func<MineFieldCell, Task> rightClick)
            : this()
        {
            Row = row;
            Col = col;
            MineCell = mineCell;

            _leftClick = leftClick;
            _rightClick = rightClick;
        }

        public int Row { get; }
        public int Col { get; }
        public MineCell MineCell { get; }

        public void RefreshDisplay(bool flagMode)
        {
            switch (MineCell?.GetVisibleState()?? MineState.Covered)
            {
                case MineState.Covered:
                    CellTextBlock.Text = flagMode ? "?" : "";
                    break;
                case MineState.Uncovered:
                    CellTextBlock.Text = MineCell.NeighbourhoodMineCount.ToString();
                    break;
                case MineState.Flagged:
                    CellTextBlock.Text = "!";
                    break;
                case MineState.IncorrectlyFlagged:
                    CellTextBlock.Text = "/";
                    break;
                case MineState.Mine:
                    CellTextBlock.Text = "*";
                    break;
                case MineState.MineDetonated:
                    CellTextBlock.Text = "@";
                    break;
            }
        }

        private async void UserControl_Tapped(object sender, TappedRoutedEventArgs e)
        {
            await _leftClick(this);
        }

        private async void UserControl_RightTapped(object sender, RightTappedRoutedEventArgs e)
        {
            await _rightClick(this);
        }
    }
}
