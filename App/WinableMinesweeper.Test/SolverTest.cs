using System.Collections.Generic;
using System.Diagnostics;
using Xunit;

namespace WinableMinesweeper.Test
{
    public class UnitTest1
    {
        [Theory]
        [InlineData("Easy", 0, 0, GameState.Victory, 5, 5, new[] { 2, 2, 2, 3 })]
        [InlineData("Hard", 0, 2, GameState.Victory, 5, 5, new[] { 0, 0, 2, 0, 4, 0, 1, 4, 3, 4 })]
        [InlineData("Impossible", 0, 0, GameState.InProgress, 3, 3, new[] { 0, 1, 1, 0 })]
        public void SolverCanWinGamesButNotAll(string title, int rowStart, int colStart, GameState finalState, int rows, int cols, int[] minedCellsPositions)
        {
            var minedCells = new List<MineCell>();

            for (int i = 0; i < minedCellsPositions.Length; i += 2)
            {
                minedCells.Add(new MineCell(minedCellsPositions[i], minedCellsPositions[i + 1]));
            }

            var mineField = new MineField(rows, cols, minedCells.ToArray());
            var solver = new Solver(mineField);
            mineField.UncoverCell(rowStart, colStart);
            solver.UncoverGrid();

            Assert.Equal(mineField.GameState, finalState);

            mineField.Reset();

            mineField.UncoverCell(rowStart, colStart);

            for (var i = 0; i < 100 && mineField.GameState == GameState.InProgress; i++)
            {
                solver.PlayNextStep();
            }

            Assert.Equal(finalState, mineField.GameState);
        }
    }
}
