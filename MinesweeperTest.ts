/// <reference path="underscore.d.ts" />
/// <reference path="qunit.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

QUnit.test("First move is always on an blanck cell", assert => {
    let firstMove = new Cell(5, 5);
    let minefield = MineField.generateFieldWithSafeZone(10, 10, 30, firstMove);
    minefield.uncoverCell(firstMove.row, firstMove.col);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let uncoveredCell = minefield.getVisibleCell(firstMove.row, firstMove.col);
    assert.strictEqual(uncoveredCell.state, mineState.uncovered);
    assert.strictEqual(uncoveredCell.neighbourMineCount, 0);
});

QUnit.test("Solver can win easy grid", assert => {
    let easyGrid = new RawField(5, 5, [new Cell(2, 2), new Cell(2, 3)]);
    let minefield = new MineField(easyGrid);
    minefield.uncoverCell(0, 0);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let solver = new MinesweeperSolver(minefield);
    solver.uncoverGrid();

    assert.strictEqual(minefield.gameState, gameState.victory);
});

QUnit.test("Solver can win hard grid", assert => {
    let easyGrid = new RawField(5, 3, [new Cell(0, 0), new Cell(2, 0), new Cell(4, 0)]);
    let minefield = new MineField(easyGrid);
    minefield.uncoverCell(0, 2);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let solver = new MinesweeperSolver(minefield);
    solver.uncoverGrid();

    assert.strictEqual(minefield.gameState, gameState.victory);
});

QUnit.test("Solver can't win impossible grid", assert => {
    let easyGrid = new RawField(3, 3, [new Cell(0, 1), new Cell(1, 0)]);
    let minefield = new MineField(easyGrid);
    minefield.uncoverCell(0, 0);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let solver = new MinesweeperSolver(minefield);
    solver.uncoverGrid();

    assert.strictEqual(minefield.gameState, gameState.inProgress);
});
