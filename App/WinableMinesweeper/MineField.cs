using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WinableMinesweeper
{
    public class MineField
    {
        private readonly MineCell[] _mineField;
        private readonly int _rows;
        private readonly int _cols;
        private readonly int _mineCount;

        public MineField(int rows, int cols, int mineCount)
        {
            _rows = rows;
            _cols = cols;
            _mineCount = mineCount;

            _mineField = new MineCell[rows * cols];

            for (int row = 0; row < rows; row++)
            {
                for (int col = 0; col < cols; col++)
                {
                    _mineField[GetCellIndex(row, col)] = new MineCell(row, col);
                }
            }
        }

        private void Init(int rowStart, int colStart)
        {
            var forbidenCells = new HashSet<MineCell>(getNeighbours(rowStart, colStart));

            var actualMineCount = 0;
            var rnd = new Random();
            while (actualMineCount < _mineCount)
            {
                var row = rnd.Next(_rows - 1);
                var col = rnd.Next(_cols - 1);
                var cell = GetCell(row, col);
                if (!cell.HasMine && !forbidenCells.Contains(cell))
                {
                    cell.HasMine = true;
                    actualMineCount++;
                }
            }
        }

        private IEnumerable<MineCell> getNeighbours(int row, int col)
        {
            var minRow = Math.Max(0, row - 1);
            var maxRow = Math.Min(_rows - 1, row + 1);
            var minCol = Math.Max(0, col - 1);
            var maxCol = Math.Min(_cols - 1, col + 1);

            for (var rowNeighbour = minRow; rowNeighbour <= maxRow; rowNeighbour++)
            {
                for (var colNeighbour = minCol; colNeighbour <= maxCol; colNeighbour++)
                {
                    yield return GetCell(rowNeighbour, colNeighbour);
                }
            }
        }

        private MineCell GetCell(int row, int col) => _mineField[GetCellIndex(row, col)];

        private int GetCellIndex(int row, int col) => row * _cols + col;
    }
}
