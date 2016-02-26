﻿using System;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace WinableMinesweeper
{
    public sealed partial class MineFieldCell : UserControl
    {
        private static readonly SolidColorBrush DefaultTextColorBrush = new SolidColorBrush(Colors.Black);

        private readonly Func<MineFieldCell, Task> _leftClick;
        private readonly Func<MineFieldCell, Task> _rightClick;

        private MineState _previousState;

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

            _previousState = MineState.Covered;
            _leftClick = leftClick;
            _rightClick = rightClick;
        }

        public int Row { get; }
        public int Col { get; }
        public MineCell MineCell { get; }

        private async void UserControl_Tapped(object sender, TappedRoutedEventArgs e)
        {
            await _leftClick(this);
        }

        private async void UserControl_RightTapped(object sender, RightTappedRoutedEventArgs e)
        {
            await _rightClick(this);
        }

        public void RefreshDisplay(bool flagMode, GameState gameState)
        {
            var mineState = (gameState == GameState.Victory || gameState == GameState.Defeat) ? MineCell.GetState() : MineCell.GetVisibleState(flagMode);

            if (_previousState == mineState)
            {
                return;
            }

            switch (mineState)
            {
                case MineState.Covered:
                    Cover();
                    CellTextBlock.Text = "";
                    break;
                case MineState.CoveredFlagMode:
                    Cover(new SolidColorBrush(new Color { R = 0, G = 0, B = 0, A = 50 }));
                    CellTextBlock.Text = "?";
                    break;
                case MineState.Uncovered:
                    Uncover(new SolidColorBrush(GetNumberColor(MineCell.NeighbourhoodMineCount)));
                    CellTextBlock.Text = MineCell.NeighbourhoodMineCount.ToString();
                    break;
                case MineState.Flagged:
                    Cover();
                    CellTextBlock.Text = "!";
                    break;
                case MineState.IncorrectlyFlagged:
                    Cover();
                    CellTextBlock.Text = "X";
                    CellBorder.Background = new SolidColorBrush(Colors.Orange);
                    break;
                case MineState.Mine:
                    Uncover();
                    CellTextBlock.Text = "*";
                    break;
                case MineState.MineDetonated:
                    Cover();
                    CellTextBlock.Text = "@";
                    CellBorder.Background = new SolidColorBrush(Colors.Red);
                    break;
            }
        }

        private void Uncover(Brush foreground = null)
        {
            CellTextBlock.Foreground = foreground ?? DefaultTextColorBrush;
            CellBorder.Background = new SolidColorBrush(Colors.Transparent);
            CellBorder.BorderThickness = new Thickness(0);
        }

        private void Cover(Brush foreground = null)
        {
            CellTextBlock.Foreground = foreground ?? DefaultTextColorBrush;
            CellBorder.Background = new SolidColorBrush(Colors.LightGray);
            CellBorder.BorderThickness = new Thickness(1);
        }

        private Color GetNumberColor(int neighbourhoodCount)
        {
            switch (neighbourhoodCount)
            {
                case 0:
                    return Colors.Transparent;
                case 1:
                    return Colors.LightBlue;
                case 2:
                    return Colors.LightGreen;
                case 3:
                    return Colors.Red;
                case 4:
                    return Colors.Blue;
                case 5:
                    return Colors.SaddleBrown;
                case 6:
                    return Colors.Green;
                default:
                    return Colors.Black;
            }
        }
    }
}
