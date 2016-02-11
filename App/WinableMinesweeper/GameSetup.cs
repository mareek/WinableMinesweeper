namespace WinableMinesweeper
{
    public class GameSetup
    {
        public GameSetup(int rows, int cols, int mineCount)
        {
            Rows = rows;
            Cols = cols;
            MineCount = mineCount;
        }

        public int Rows { get; }
        public int Cols { get; }
        public int MineCount { get; }
    }
}
