namespace WinableMinesweeper
{
    public class GameSetup
    {
        public GameSetup(Dificulty dificulty)
        {
            GameDificulty = dificulty;

            switch (dificulty)
            {
                case Dificulty.Medium:
                    Rows = 16;
                    Cols = 16;
                    MineCount = 40;
                    break;
                case Dificulty.Hard:
                    Rows = 16;
                    Cols = 30;
                    MineCount = 99;
                    break;
                case Dificulty.Easy:
                default:
                    Rows = 9;
                    Cols = 9;
                    MineCount = 10;
                    break;
            }
        }

        public Dificulty? GameDificulty { get; }

        public int Rows { get; }
        public int Cols { get; }
        public int MineCount { get; }
    }
}
