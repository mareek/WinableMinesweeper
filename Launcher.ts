/// <reference path="underscore.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

var _field: mineField;
var _solver: minesweeperSolver;

var _cols = 0;
var _rows = 0;
var _mineCount = 0;

$(() => {
    $('#easyButton').click(() => initMineField(9, 9, 10));
    $('#mediumButton').click(() => initMineField(16, 16, 40));
    $('#hardButton').click(() => initMineField(16, 30, 99));
    $('#autoplayButton').click(() => autoplay());
    $('#instantAutoplayButton').click(() => instantAutoplay());
});

function initMineField(rows: number, cols: number, mineCount: number) {
    _field = null;
    _solver = null;
    _cols = cols;
    _rows = rows;
    _mineCount = mineCount;

    var mineFieldTable = $('#mineFieldTable');
    $('tr').remove();
    for (var row = 0; row < rows; row++) {
        var tr = $('<tr>');
        for (var col = 0; col < cols; col++) {
            tr.append(createCell(row, col));
        }

        mineFieldTable.append(tr);
    }

    showMineField(rows, cols);
}

function createCell(row: number, col: number): JQuery {
    return $('<td>', {
        'id': 'cell-' + row + '-' + col,
        mousedown: e => clickCell(row, col, e),
        contextmenu: e => false
    });
}

function autoplay() {
    if (!_field && _rows !== 0) {
        createField(true);
    }

    if (_solver && _field.gameState === gameState.inProgress && _solver.playNextStep()) {
        showMineField();
        window.setTimeout(autoplay, 100);
    }
}

function instantAutoplay() {
    if (!_field && _rows !== 0) {
        createField(true);
    }

    if (_solver && _field.gameState === gameState.inProgress) {
        _solver.uncoverGrid();
        showMineField();
    }
}

function createField(withSafeStart: boolean) {
    _field = new mineField(_rows, _cols, _mineCount);
    _solver = new minesweeperSolver(_field);
    if (withSafeStart) {
        var startCell = _field.getSafeStart();
        _field.uncoverCell(startCell.row, startCell.col);
    }
}

function clickCell(row: number, col: number, event: JQueryMouseEventObject) {
    if (!_field) {
        do {
            createField(false)
        } while (_field.uncoverCell(row, col).neighbourMineCount !== 0 || _field.gameState === gameState.failure)
    } else if (event.which === 1) {
        _field.uncoverCell(row, col);
    } else if (event.which === 3) {
        _field.flagCell(row, col);
    } else if (event.which === 2) {
        _field.uncoverNeighbours(row, col);
    }

    showMineField();

    return false;
}

function showMineField(rows?: number, cols?: number) {
    if (!_field) {
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                showCell(row, col, getCellContent(mineState.covered, 0));
            }
        }
    } else {
        _.each(_field.getMineField(), cell => showCell(cell.row, cell.col, getCellContent(cell.state, cell.neighbourMineCount)));
    }
}

function showCell(row: number, col: number, backgroundPosition: string) {
    $('#cell-' + row + '-' + col).css("background-position", backgroundPosition);
}

function getCellContent(state: mineState, neighbourMineCount: number): string {
    switch (state) {
        case mineState.covered:
            return '-90px 0px';
        case mineState.uncovered:
            switch (neighbourMineCount) {
                case 0:
                    return '-90px -30px';
                case 1:
                    return '-90px -90px';
                case 2:
                    return '-90px -60px';
                case 3:
                    return '-60px -90px';
                case 4:
                    return '-60px -30px';
                case 5:
                    return '0px -60px';
                case 6:
                    return '-30px -30px';
                case 7:
                    return '-115px -115px';
                case 8:
                    return '-115px -115px';
                default:
                    return '-90px 0px';
            }
        case mineState.mine:
            return '0px 0px';
        case mineState.mineDetonated:
            return '-30px 0px';
        case mineState.flagged:
            return '-60px 0px';
        case mineState.incorrectlyFlagged:
            return '0px -30px';
    }
}
