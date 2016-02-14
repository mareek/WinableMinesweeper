using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace WinableMinesweeper
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MineFieldPage : Page
    {
        private MineField _minefield;
        private bool _flagMode;

        public MineFieldPage()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            var setup = e.Parameter as GameSetup ?? new GameSetup(9, 9, 10);
            _minefield = new MineField(setup.Rows, setup.Cols, setup.MineCount);
            InitGrid();
        }

        private void InitGrid()
        {
            MineGrid.ColumnDefinitions.Clear();
            MineGrid.RowDefinitions.Clear();
            MineGrid.Children.Clear();
            MineGrid.Height = 40 * _minefield.Rows;
            MineGrid.Width = 40 * _minefield.Cols;

            for (int row = 0; row < _minefield.Rows; row++)
            {
                MineGrid.RowDefinitions.Add(new RowDefinition());
            }

            for (int col = 0; col < _minefield.Cols; col++)
            {
                MineGrid.ColumnDefinitions.Add(new ColumnDefinition());
            }

            for (int row = 0; row < _minefield.Rows; row++)
            {
                for (int col = 0; col < _minefield.Cols; col++)
                {
                    var cell = new MineFieldCell(row, col, _minefield.GetCell(row, col), LeftClick, RightClick);
                    Grid.SetRow(cell, row);
                    Grid.SetColumn(cell, col);
                    MineGrid.Children.Add(cell);
                }
            }
        }

        private async Task InitMineFieldIfNeeded(int rowStart, int colStart)
        {
            if (_minefield.GameState == GameState.NotStarted)
            {
                bool isWinable = false;
                do
                {
                    _minefield.Reset(false);
                    _minefield.Init(rowStart, colStart);
                    _minefield.UncoverCell(rowStart, colStart);
                    await Task.Run(() => new Solver(_minefield).UncoverGrid());
                    isWinable = _minefield.GameState == GameState.Victory;
                } while (!isWinable);

                _minefield.Reset(true);
            }
        }

        private void Refresh()
        {
            foreach (var fieldCell in MineGrid.Children.OfType<MineFieldCell>())
            {
                fieldCell.RefreshDisplay(_flagMode);
            }
        }

        private async Task LeftClick(MineFieldCell fieldCell)
        {
            await Click(fieldCell, !_flagMode);
        }

        private async Task RightClick(MineFieldCell fieldCell)
        {
            await Click(fieldCell, _flagMode);
        }

        private async Task Click(MineFieldCell fieldCell, bool uncover)
        {
            var row = fieldCell.Row;
            var col = fieldCell.Col;
            await InitMineFieldIfNeeded(row, col);

            if (uncover)
            {
                _minefield.UncoverCell(row, col);
            }
            else
            {
                _minefield.ToggleFlagOnCell(row, col);
            }

            Refresh();
        }
    }
}
