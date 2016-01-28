using System;
using System.Collections.Generic;
using System.Linq;

namespace WinableMinesweeper
{
    public class Solver
    {
        private readonly MineField _mineField;

        public Solver(MineField mineField)
        {
            _mineField = mineField;
        }

        public bool playNextStep()
        {
            var rnd = new Random();
            var uncoveredCells = _mineField.Cells.Where(c => c.GetVisibleState() == MineState.Uncovered);
            return uncoveredCells.Any(cell => playEasyMoves(cell, true)); //|| playHardMoves(uncoveredCells, true);
        }

        public void uncoverGrid()
        {
            var hasMoved = false;
            do
            {
                var uncoveredCells = _mineField.Cells.Where(c => c.GetVisibleState() == MineState.Uncovered);
                hasMoved = uncoveredCells.Count(cell => playEasyMoves(cell, false)) > 0; // || playHardMoves(uncoveredCells, false);
            }
            while (hasMoved && _mineField.GameState == GameState.inProgress);
        }

        private bool playEasyMoves(MineCell cell, bool returnOnFirstAction)
        {
            var result = false;
            var neighbours = _mineField.GetNeighbours(cell).ToArray();
            var flaggedNeighbours = neighbours.Where(c => c.GetVisibleState() == MineState.Flagged).ToArray();
            var coveredNeighbours = neighbours.Where(c => c.GetVisibleState() == MineState.Covered).ToArray();

            if (coveredNeighbours.Length > 0 && cell.NeighbourhoodMineCount == (flaggedNeighbours.Length + coveredNeighbours.Length))
            {
                for (var i = 0; i < coveredNeighbours.Length && !(result && returnOnFirstAction); i++)
                {
                    coveredNeighbours[i].HasFlag = true;
                    result = true;
                }
            }
            else if (coveredNeighbours.Length > 0 && cell.NeighbourhoodMineCount == flaggedNeighbours.Length)
            {
                for (var i = 0; i < coveredNeighbours.Length && !(result && returnOnFirstAction); i++)
                {
                    _mineField.UncoverCell(coveredNeighbours[i]);
                    result = true;
                }
            }

            return result;
        }


        private class MinedZone
        {
            public MineCell[] Cells { get; }

            public int MineCount { get; }

            public MinedZone(int mineCount, MineCell[] cells)
            {
                Cells = cells;
                MineCount = mineCount;
            }

            public bool intersect(MinedZone other) => other != this && Cells.Intersect(other.Cells).Any();

            public IEnumerable<MineCell> difference(MinedZone other) => Cells.Except(other.Cells);
        }
    }
}
