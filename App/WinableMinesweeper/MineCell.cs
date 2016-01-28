using System.Collections.Generic;
using System.Linq;

namespace WinableMinesweeper
{
    public class MineCell
    {
        public int Row { get; }

        public int Col { get; }

        public bool HasMine { get; set; }

        public int NeighbourhoodMineCount { get; set; }

        public bool HasFlag { get; set; }

        public bool IsUncovered { get; set; }

        public MineCell(int row, int col)
        {
            Row = row;
            Col = col;
        }

        public MineState GetVisibleState()
        {
            var state = GetState();

            switch (state)
            {
                case MineState.IncorrectlyFlagged:
                    return MineState.Flagged;
                case MineState.Mine:
                    return MineState.Covered;
                default:
                    return state;
            }
        }

        public MineState GetState()
        {
            if (IsUncovered && !HasMine)
            {
                return MineState.Uncovered;
            }
            else if (IsUncovered && HasMine)
            {
                return MineState.MineDetonated;
            }
            else if (HasFlag && !HasMine)
            {
                return MineState.IncorrectlyFlagged;
            }
            else if (HasFlag)
            {
                return MineState.Flagged;
            }
            else if (HasMine)
            {
                return MineState.Mine;
            }
            else {
                return MineState.Covered;
            }
        }
    }

    public static class MineCellExtension
    {
        public static IEnumerable<MineCell> FilterByVisibleState(this IEnumerable<MineCell> cells, MineState visibleState)
            => cells.Where(c => c.GetVisibleState() == visibleState);
    }
}
