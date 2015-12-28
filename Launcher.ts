/// <reference path="underscore.d.ts" />
/// <reference path="jquery.d.ts" />
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

    showMineField(rows, cols);
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

function showMineField(rows?: number, cols?: number) {
    if (!_field) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                showCell(row, col, getCellContent(mineState.covered, 0));
            }
        }
    } else {
        _.each(_field.getVisibleField(), cell => showCell(cell.row, cell.col, getCellContent(cell.state, cell.neighbourMineCount)));
    }
}

function showCell(row: number, col: number, backgroundPosition: string) {
    $("#cell-" + row + "-" + col).css("background-position", backgroundPosition);
}

function getCellContent(state: mineState, neighbourMineCount: number): string {
    switch (state) {
        case mineState.covered:
            return _flagMode ? "-30px -60px" : "-90px 0px";
        case mineState.uncovered:
            switch (neighbourMineCount) {
                case 0:
                    return "-90px -30px";
                case 1:
                    return "-90px -90px";
                case 2:
                    return "-90px -60px";
                case 3:
                    return "-60px -90px";
                case 4:
                    return "-60px -30px";
                case 5:
                    return "0px -60px";
                case 6:
                    return "-30px -30px";
                case 7:
                    return "0px -90px";
                case 8:
                    return "-60px -60px";
                default:
                    return "-90px -30px";
            }
        case mineState.mine:
            return "0px 0px";
        case mineState.mineDetonated:
            return "-30px 0px";
        case mineState.flagged:
            return "-60px 0px";
        case mineState.incorrectlyFlagged:
            return "0px -30px";
    }
}
