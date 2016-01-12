/// <reference path="jquery.d.ts" />
/// <reference path="underscore.d.ts" />
/// <reference path="konami.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

let _flagMode = false;

let _field: MineField;
let _solver: MinesweeperSolver;

let _cols = 0;
let _rows = 0;
let _mineCount = 0;

$(() => {
    $("#easyButton").click(() => initMineField(9, 9, 10));
    $("#mediumButton").click(() => initMineField(16, 16, 40));
    $("#hardButton").click(() => initMineField(16, 30, 99));
    $("#autoplayButton").click(() => autoplay());
    $("#flagButton").click(() => toggleFlagMode());
});

let easter_egg = new Konami(autoplay);

function initMineField(rows: number, cols: number, mineCount: number) {
    _field = null;
    _solver = null;
    _cols = cols;
    _rows = rows;
    _mineCount = mineCount;

    const mineFieldTable = $("#mineFieldTable");
    $("tr").remove();
    for (let row = 0; row < rows; row++) {
        const tr = $("<tr>");
        for (let col = 0; col < cols; col++) {
            tr.append(createCell(row, col));
        }

        mineFieldTable.append(tr);
    }

    showMineField();
}

function createCell(row: number, col: number): JQuery {
    return $("<td>", {
        "id": "cell-" + row + "-" + col,
        mousedown: e => clickCell(row, col, e),
        contextmenu: e => false
    });
}

function autoplay() {
    if (!_field && _rows !== 0) {
        createField(Math.floor(_rows / 2), Math.floor(_cols / 2));
    }

    if (_solver && _field.gameState === gameState.inProgress && _solver.playNextStep()) {
        showMineField();
        window.setTimeout(autoplay, 100);
    }
}

function toggleFlagMode() {
    _flagMode = !_flagMode;
    showMineField();
}

function createField(row: number, col: number) {
    let attemptCount = 0;
    let start = Date.now();
    let isWinable = false;
    let startCell = new Cell(row, col);
    do {
        attemptCount++;
        _field = MineField.generateFieldWithSafeZone(_rows, _cols, _mineCount, startCell);
        _solver = new MinesweeperSolver(_field);
        isWinable = isFieldWinableFromPosition(startCell.row, startCell.col);
    } while (!isWinable);

    _field.uncoverCell(startCell.row, startCell.col);

    let duration = (Date.now() - start) / 1000;
    $("#debugLabel").text("Attemps : " + attemptCount.toString() + " in " + duration.toString() + " s.");
}

function isFieldWinableFromPosition(row: number, col: number): boolean {
    _field.uncoverCell(row, col);
    _solver.uncoverGrid();
    const result = _field.gameState === gameState.victory;
    _field.reset();
    return result;
}

function clickCell(row: number, col: number, event: JQueryMouseEventObject) {
    if (_field && _field.gameState !== gameState.inProgress) {
        return false;
    } else if (!_field) {
        createField(row, col);
    } else if (_field.getVisibleCell(row, col).state === mineState.uncovered) {
        _field.uncoverNeighbours(row, col);
    } else if (_flagMode || event.which === 3) {
        _field.toggleFlagOnCell(row, col);
    } else if (event.which === 1) {
        _field.uncoverCell(row, col);
    } else if (event.which === 2) {
        _field.uncoverNeighbours(row, col);
    }

    showMineField();

    return false;
}

function showMineField() {
    if (!_field) {
        for (let row = 0; row < _rows; row++) {
            for (let col = 0; col < _cols; col++) {
                showCell(row, col, getCellClass(mineState.covered, 0));
            }
        }
    } else {
        _.each(_field.getVisibleField(), cell => showCell(cell.row, cell.col, getCellClass(cell.state, cell.neighbourMineCount)));

        if (_field.gameState !== gameState.inProgress) {
            let outcome = (_field.gameState === gameState.victory) ? "Victory :-)" : "Failure :-(";
            let duration = Math.floor((_field.end.valueOf() - _field.start.valueOf()) / 1000);
            $("#debugLabel").text(outcome + " in " + duration.toString() + " s.");
        }
    }
}

function showCell(row: number, col: number, cssClass: string) {
    $("#cell-" + row + "-" + col).removeClass().addClass(cssClass);
}

function getCellClass(state: mineState, neighbourMineCount: number): string {
    switch (state) {
        case mineState.covered:
            return "covered" + (_flagMode ? "-flaggable" : "");
        case mineState.flagged:
            return "flagged";
        case mineState.incorrectlyFlagged:
            return "incorrectly-flagged";
        case mineState.mine:
            return "mine";
        case mineState.mineDetonated:
            return "mine-detonated";
        case mineState.uncovered:
            return "uncovered-" + neighbourMineCount.toString();
    }
}
