/// <reference path="underscore.d.ts" />
/// <reference path="qunit.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

QUnit.test("First move is always on an blanck cell", assert => {
    let firstMove = new Cell(5, 5);
    let minefield = MineField.generateFieldWithSafeZone(10, 10, 30, firstMove);
    minefield.uncoverCell(firstMove.row, firstMove.col);
    let uncoveredCell = minefield.getVisibleCell(firstMove.row, firstMove.col);
    assert.equal(uncoveredCell.state, mineState.uncovered);
    assert.equal(uncoveredCell.neighbourMineCount, 0);
}); 