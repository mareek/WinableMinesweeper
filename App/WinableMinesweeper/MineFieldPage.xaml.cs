using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
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
        private GameSetup _setup;

        public MineFieldPage()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            _setup = e.Parameter as GameSetup ?? new GameSetup(9, 9, 10);
            InitGrid();
        }

        private void InitGrid()
        {
            MineGrid.ColumnDefinitions.Clear();
            MineGrid.RowDefinitions.Clear();
            MineGrid.Children.Clear();

            for (int row = 0; row < _setup.Rows; row++)
            {
                MineGrid.RowDefinitions.Add(new RowDefinition());
            }

            for (int col = 0; col < _setup.Cols; col++)
            {
                MineGrid.ColumnDefinitions.Add(new ColumnDefinition());
            }

            for (int row = 0; row < _setup.Rows; row++)
            {
                for (int col = 0; col < _setup.Cols; col++)
                {
                    var cell = new MineFieldCell(row, col);
                    Grid.SetRow(cell, row);
                    Grid.SetColumn(cell, col);
                    MineGrid.Children.Add(cell);
                }
            }
        }
    }
}
