using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace WinableMinesweeper
{
    public class MineField
    {
        public int Rows { get; }
        public int Cols { get; }
        private readonly int _mineCount;

        private readonly Stopwatch _chrono = new Stopwatch();

        public MineCell[] Cells { get; }

        public GameState GameState { get; private set; }

        public TimeSpan Duration => _chrono.Elapsed;

        public int ActualMineCount => _mineCount - Cells.Count(c => c.HasFlag);

        public MineField(int rows, int cols, params MineCell[] minedCells)
            : this(rows, cols, minedCells.Length)
        {
            foreach (var minedCell in minedCells)
            {
                GetCell(minedCell.Row, minedCell.Col).HasMine = true;
            }

            InitMineCount();

            GameState = GameState.InProgress;
        }

        public MineField(int rows, int cols, int mineCount)
        {
            Rows = rows;
            Cols = cols;
            _mineCount = mineCount;
            GameState = GameState.NotStarted;

            Cells = new MineCell[rows * cols];

            for (int row = 0; row < rows; row++)
            {
                for (int col = 0; col < cols; col++)
                {
                    Cells[GetCellIndex(row, col)] = new MineCell(row, col);
                }
            }
        }

        public MineCell GetCell(int row, int col) => Cells[GetCellIndex(row, col)];

        private int GetCellIndex(int row, int col) => row * Cols + col;

        public void Init(int rowStart, int colStart)
        {
            var forbidenCells = new HashSet<MineCell>(GetNeighbours(rowStart, colStart));

            var actualMineCount = 0;
            var rnd = new Random();
            while (actualMineCount < _mineCount)
            {
                var row = rnd.Next(Rows - 1);
                var col = rnd.Next(Cols - 1);
                var cell = GetCell(row, col);
                if (!cell.HasMine && !forbidenCells.Contains(cell))
                {
                    cell.HasMine = true;
                    actualMineCount++;
                }
            }

            InitMineCount();

            GameState = GameState.InProgress;
            _chrono.Start();
        }

        private void InitMineCount()
        {
            foreach (var cell in Cells.Where(c => !c.HasMine))
            {
                cell.NeighbourhoodMineCount = GetNeighbours(cell).Count(c => c.HasMine);
            }
        }

        public IEnumerable<MineCell> GetNeighbours(MineCell cell) => GetNeighbours(cell.Row, cell.Col);

        private IEnumerable<MineCell> GetNeighbours(int row, int col)
        {
            var minRow = Math.Max(0, row - 1);
            var maxRow = Math.Min(Rows - 1, row + 1);
            var minCol = Math.Max(0, col - 1);
            var maxCol = Math.Min(Cols - 1, col + 1);

            for (var rowNeighbour = minRow; rowNeighbour <= maxRow; rowNeighbour++)
            {
                for (var colNeighbour = minCol; colNeighbour <= maxCol; colNeighbour++)
                {
                    yield return GetCell(rowNeighbour, colNeighbour);
                }
            }
        }

        public void ToggleFlagOnCell(int row, int col)
        {
            var cell = GetCell(row, col);
            cell.HasFlag = !cell.HasFlag && !cell.IsUncovered;
        }

        public void UncoverCell(int row, int col) => UncoverCell(GetCell(row, col));

        public void UncoverCell(MineCell cell)
        {
            if (cell.HasFlag || cell.IsUncovered)
            {
                return;
            }

            cell.IsUncovered = true;
            if (cell.HasMine)
            {
                GameState = GameState.Defeat;
                _chrono.Stop();
            }
            else {
                if (cell.NeighbourhoodMineCount == 0)
                {
                    UncoverNeighbours(cell);
                }

                if (Cells.All(c => c.HasMine ^ c.IsUncovered))
                {
                    GameState = GameState.Victory;
                    _chrono.Stop();
                }
            }
        }

        public void UncoverNeighbours(int row, int col) => UncoverNeighbours(GetCell(row, col));

        public void UncoverNeighbours(MineCell cell)
        {
            var neighbours = GetNeighbours(cell);
            if (!cell.HasFlag && neighbours.Count(c => c.HasFlag) == cell.NeighbourhoodMineCount)
            {
                foreach (var neighbour in GetNeighbours(cell))
                {
                    UncoverCell(neighbour);
                }
            }
        }

        public void Reset(bool keepMines)
        {
            foreach (var mineCell in Cells)
            {
                mineCell.IsUncovered = false;
                mineCell.HasFlag = false;
                mineCell.HasMine &= keepMines;
            }

            GameState = keepMines ? GameState.InProgress : GameState.NotStarted;
            _chrono.Reset();
            _chrono.Start();
        }

        public string GetDebugState()
        {
            var stateBuilder = new StringBuilder(Cells.Length + Rows);
            for (int row = 0; row < Rows; row++)
            {
                for (int col = 0; col < Cols; col++)
                {
                    stateBuilder.Append(GetCell(row, col).GetDebugState());
                }

                stateBuilder.Append('\n');
            }

            return stateBuilder.ToString();
        }
    }
}
