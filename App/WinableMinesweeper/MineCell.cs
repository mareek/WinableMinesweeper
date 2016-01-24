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

        public MineState GetState()
        {
            if (IsUncovered && !HasMine)
            {
                return MineState.Uncovered;
            }
            else if (HasMine && IsUncovered)
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
}
