using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;

namespace WinableMinesweeper
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MineFieldPage : Page
    {
        private MineField _minefield;
        private bool _flagMode = false;
        private Dificulty? _dificulty;

        public MineFieldPage()
        {
            this.InitializeComponent();
            SystemNavigationManager.GetForCurrentView().AppViewBackButtonVisibility = AppViewBackButtonVisibility.Visible;
            SystemNavigationManager.GetForCurrentView().BackRequested += OnBackRequested;
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            var setup = e.Parameter as GameSetup ?? new GameSetup(Dificulty.Easy);
            _dificulty = setup.GameDificulty;
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

        private async Task<bool> InitMineFieldIfNeeded(int rowStart, int colStart)
        {
            if (_minefield.GameState != GameState.NotStarted)
            {
                return false;
            }
            else
            {
                bool isWinable = false;
                int attempt = 0;
                var chrono = Stopwatch.StartNew();
                do
                {
                    DebugTextBlock.Text = $"Attempt n°{++attempt} in {chrono.ElapsedMilliseconds / 1000m}";
                    _minefield.Reset(false);
                    _minefield.Init(rowStart, colStart);
                    _minefield.UncoverCell(rowStart, colStart);
                    await Task.Run(() => new Solver(_minefield).UncoverGrid());
                    isWinable = _minefield.GameState == GameState.Victory;
                } while (!isWinable);

                _minefield.Reset(true);
                _minefield.UncoverCell(rowStart, colStart);
                Refresh();
                return true;
            }
        }

        private void Refresh()
        {
            foreach (var fieldCell in MineGrid.Children.OfType<MineFieldCell>())
            {
                fieldCell.RefreshDisplay(_flagMode, _minefield.GameState);
            }

            var seconds = (int)Math.Floor(_minefield.Duration.TotalSeconds);
            if (_minefield.GameState == GameState.Victory)
            {
                Victory(seconds);
            }
            else if (_minefield.GameState == GameState.Defeat)
            {
                DebugTextBlock.Text = $"You lost in {seconds} s. :-(";
            }
        }

        private void Victory(int seconds)
        {
            DebugTextBlock.Text = $"You won in {seconds} s.  B-)";
            if (_dificulty.HasValue && seconds < (HighScores.GetHighScore(_dificulty.Value) ?? int.MaxValue))
            {
                DebugTextBlock.Text += "\nNEW HIGH SCORE !";
                HighScores.SetHighScore(_dificulty.Value, seconds);
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
            var cell = fieldCell.MineCell;

            if (_minefield.GameState == GameState.Defeat
                || _minefield.GameState == GameState.Victory
                || await InitMineFieldIfNeeded(cell.Row, cell.Col))
            {
                return;
            }

            if (cell.IsUncovered)
            {
                _minefield.UncoverNeighbours(cell);
            }
            else if (!uncover)
            {
                _minefield.ToggleFlagOnCell(cell.Row, cell.Col);
            }
            else
            {
                _minefield.UncoverCell(cell);
            }

            Refresh();
        }

        private void FlagButton_Click(object sender, RoutedEventArgs e)
        {
            _flagMode = !_flagMode;
            Refresh();
        }

        private void OnBackRequested(object sender, BackRequestedEventArgs e)
        {
            Frame.Navigate(typeof(MainPage));
            e.Handled = true;
        }

    }
}
