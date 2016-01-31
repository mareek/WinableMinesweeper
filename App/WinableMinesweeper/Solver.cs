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

        public bool PlayNextStep()
        {
            var uncoveredCells = _mineField.Cells.FilterByVisibleState(MineState.Uncovered).ToArray();
            return uncoveredCells.Any(cell => PlayEasyMoves(cell, true))
                || PlayHardMoves(uncoveredCells, true);
        }

        public void UncoverGrid()
        {
            var hasMoved = false;
            do
            {
                var uncoveredCells = _mineField.Cells.FilterByVisibleState(MineState.Uncovered).ToArray();
                hasMoved = uncoveredCells.Count(cell => PlayEasyMoves(cell, false)) > 0
                        || PlayHardMoves(uncoveredCells, false);
            }
            while (hasMoved && _mineField.GameState == GameState.InProgress);
        }

        private bool PlayEasyMoves(MineCell cell, bool returnOnFirstAction)
        {
            var result = false;
            var neighbours = _mineField.GetNeighbours(cell).ToArray();
            var flaggedNeighbours = neighbours.FilterByVisibleState(MineState.Flagged).ToArray();
            var coveredNeighbours = neighbours.FilterByVisibleState(MineState.Covered).ToArray();

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

        private bool PlayHardMoves(MineCell[] uncoveredCells, bool returnOnFirstAction)
        {
            var minedZones = GetMinedZones(uncoveredCells);

            var hardMoves = from zone in minedZones
                            from other in minedZones
                            where zone.Intersect(other)
                               && PlayHardMoves(zone, other, returnOnFirstAction)
                            select 1;

            return returnOnFirstAction
                        ? hardMoves.Any()
                        : hardMoves.Count() > 0;
        }

        private ICollection<MinedZone> GetMinedZones(MineCell[] uncoveredCells)
        {
            var minedZonesById = new Dictionary<string, MinedZone>();
            foreach (var cell in uncoveredCells)
            {
                var neighbours = _mineField.GetNeighbours(cell).ToArray();
                var flaggedNeighbours = neighbours.FilterByVisibleState(MineState.Flagged).ToArray();
                var coveredNeighbours = neighbours.FilterByVisibleState(MineState.Covered).ToArray();
                var remainingCount = cell.NeighbourhoodMineCount - flaggedNeighbours.Length;
                if (remainingCount > 0 && remainingCount < coveredNeighbours.Length)
                {
                    var zone = new MinedZone(remainingCount, coveredNeighbours);
                    minedZonesById[zone.Id] = zone;
                }
            }

            return minedZonesById.Values;
        }

        private bool PlayHardMoves(MinedZone zone, MinedZone other, bool returnOnFirstAction)
        {
            var cellsNotInOtherZone = zone.Difference(other).ToArray();
            var mineCountInOtherZone = zone.MineCount - cellsNotInOtherZone.Length;
            if (mineCountInOtherZone == other.MineCount && cellsNotInOtherZone.Length > 0)
            {
                foreach (var cell in cellsNotInOtherZone)
                {
                    cell.HasFlag = true;
                    if (returnOnFirstAction)
                    {
                        break;
                    }
                }

                return true;
            }

            var otherCellsNotInZone = other.Difference(zone).ToArray();
            var otherMineCountInZone = other.MineCount - otherCellsNotInZone.Length;
            if (otherMineCountInZone == zone.MineCount && cellsNotInOtherZone.Length > 0)
            {
                foreach (var cell in cellsNotInOtherZone)
                {
                    _mineField.UncoverCell(cell);
                    if (returnOnFirstAction)
                    {
                        break;
                    }
                }

                return true;
            }

            return false;
        }

        private class MinedZone
        {
            private readonly MineCell[] _cells;

            public string Id { get; }

            public int MineCount { get; }

            public MinedZone(int mineCount, MineCell[] cells)
            {
                MineCount = mineCount;
                _cells = cells;
                Id = string.Join("|", _cells.Select(c => $"{c.Row},{c.Col}").OrderBy(c => c));
            }

            public bool Intersect(MinedZone other) => other.Id != Id && _cells.Intersect(other._cells).Any();

            public IEnumerable<MineCell> Difference(MinedZone other) => _cells.Except(other._cells);
        }
    }
}
