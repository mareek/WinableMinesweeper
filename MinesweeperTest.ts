/// <reference path="underscore.d.ts" />
/// <reference path="qunit.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

QUnit.test("First move is always on an blanck cell", assert => {
    let firstMove = new Cell(5, 5);
    let minefield = MineField.generateFieldWithSafeZone(10, 10, 30, firstMove);

    assertDateIsAlmostNow(assert, minefield.start);
    assert.strictEqual(minefield.end.valueOf(), new Date(2000, 0, 1).valueOf());

    minefield.uncoverCell(firstMove.row, firstMove.col);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let uncoveredCell = minefield.getVisibleCell(firstMove.row, firstMove.col);
    assert.strictEqual(uncoveredCell.state, mineState.uncovered);
    assert.strictEqual(uncoveredCell.neighbourMineCount, 0);
});

QUnit.test("Uncovering mine cause defeat", assert => {
    let grid = new RawField(2, 2, [new Cell(1, 1)]);
    let minefield = new MineField(grid);
    minefield.uncoverCell(0, 0);
    minefield.toggleFlagOnCell(0, 1);
    minefield.uncoverNeighbours(0, 0);

    assert.strictEqual(minefield.gameState, gameState.failure);
    assert.strictEqual(minefield.getVisibleCell(0, 1).state, mineState.incorrectlyFlagged);
    assert.strictEqual(minefield.getVisibleCell(1, 1).state, mineState.mineDetonated);
});

QUnit.test("Solver can win easy grid", assert => {
    let easyGrid = new RawField(5, 5, [new Cell(2, 2), new Cell(2, 3)]);
    testGrid(assert, easyGrid, 0, 0, gameState.victory);
});

QUnit.test("Solver can win hard grid", assert => {
    let hardGrid = new RawField(5, 5, [new Cell(0, 0), new Cell(2, 0), new Cell(4, 0), new Cell(1, 4), new Cell(3, 4)]);
    testGrid(assert, hardGrid, 0, 2, gameState.victory);
});

QUnit.test("Solver can't win impossible grid", assert => {
    let impossibleGrid = new RawField(3, 3, [new Cell(0, 1), new Cell(1, 0)]);
    testGrid(assert, impossibleGrid, 0, 0, gameState.inProgress);
});

function assertDateIsAlmostNow(assert: QUnitAssert, date: Date) {
    assert.ok((Date.now() - date.valueOf()) < 50);
}

function testGrid(assert: QUnitAssert, grid: RawField, rowStart: number, colStart: number, finalState: gameState) {
    let minefield = new MineField(grid);
    minefield.uncoverCell(rowStart, colStart);

    assert.strictEqual(minefield.gameState, gameState.inProgress);

    let solver = new MinesweeperSolver(minefield);
    solver.uncoverGrid();

    assert.strictEqual(minefield.gameState, finalState);

    if (minefield.gameState !== gameState.inProgress) {
        assert.ok((Date.now() - minefield.end.valueOf()) < 50);
    }

    minefield.reset();

    assertDateIsAlmostNow(assert, minefield.start);

    minefield.uncoverCell(rowStart, colStart);

    assert.strictEqual(minefield.end.valueOf(), new Date(2000, 0, 1).valueOf());

    for (let i = 0; i < 100 && minefield.gameState === gameState.inProgress; i++) {
        solver.playNextStep();
    }

    assert.strictEqual(minefield.gameState, finalState);
}
