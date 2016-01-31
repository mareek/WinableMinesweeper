using Xunit;

namespace WinableMinesweeper.Test
{
    public class MineFieldTest
    {
        [Fact]
        public void FirstMoveIsAlwaysABlankCell()
        {
            var firstMove = new MineCell(4, 4);
            var minefield = new MineField(9, 9, 10);

            Assert.Equal(GameState.NotStarted, minefield.GameState);

            minefield.UncoverCell(firstMove.Row, firstMove.Col);

            Assert.Equal(GameState.InProgress, minefield.GameState);

            var uncoveredCell = minefield.GetCell(firstMove.Row, firstMove.Col);
            Assert.Equal(MineState.Uncovered, uncoveredCell.GetState());
            Assert.Equal(0, uncoveredCell.NeighbourhoodMineCount);
        }

        [Fact]
        public void FirstMoveWithFlagUncoverTheFirstCell()
        {
            var firstMove = new MineCell(4, 4);
            var minefield = new MineField(9, 9, 10);

            minefield.UncoverCell(firstMove.Row, firstMove.Col);
            Assert.Equal(GameState.InProgress, minefield.GameState);

            var uncoveredCell = minefield.GetCell(firstMove.Row, firstMove.Col);
            Assert.Equal(MineState.Uncovered, uncoveredCell.GetState());
            Assert.Equal(0, uncoveredCell.NeighbourhoodMineCount);
        }

        [Fact]
        public void UncoverMineCauseDefeat()
        {
            var minefield = new MineField(2, 2, new MineCell(1, 1));

            minefield.UncoverCell(0, 0);
            Assert.Equal(GameState.InProgress, minefield.GameState);
            minefield.ToggleFlagOnCell(0, 1);
            minefield.UncoverNeighbours(0, 0);

            Assert.Equal(GameState.Defeat, minefield.GameState);
            Assert.Equal(MineState.IncorrectlyFlagged, minefield.GetCell(0, 1).GetState());
            Assert.Equal(MineState.MineDetonated, minefield.GetCell(1, 1).GetVisibleState());
        }
    }
}
