/// <reference path="underscore.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Minesweeper.ts" />
/// <reference path="Solver.ts" />

var field: mineField;
var solver: minesweeperSolver;

$(() => {
	$('#easyButton').click(e=> initMineField(9, 9, 10));
	$('#mediumButton').click(e=> initMineField(16, 16, 40));
	$('#hardButton').click(e=> initMineField(16, 30, 99));
	$('#helpButton').click(() => help());
});

function initMineField(rows: number, cols: number, mineCount: number) {
	field = null;
	solver = null;
	var createNewField = () => new mineField(rows, cols, mineCount);
	var mineFieldTable = $('#mineFieldTable');
	$('tr').remove();
	for (var row = 0; row < rows; row++) {
		mineFieldTable.append(createRow(row, cols, createNewField));
	}

	showMineField(rows, cols);
}

function createRow(row: number, cols: number, createNewField: () => mineField): JQuery {
	var tr = $('<tr>');
	for (var col = 0; col < cols; col++) {
		tr.append(createCell(row, col, createNewField));
	}

	return tr;
}

function createCell(row: number, col: number, createNewField: () => mineField): JQuery {
	return $('<td>', {
		'id': 'cell-' + row + '-' + col,
		mousedown: e => clickCell(row, col, e, createNewField),
		contextmenu: e => false
	});
}

function help() {
	if (!field) {
		return;
	}

	if (!solver) {
		solver = new minesweeperSolver(field);
	}

	if (solver.playNextStep()) {
		showMineField();
	}
}

function clickCell(row: number, col: number, event: JQueryMouseEventObject, createNewField: () => mineField) {
	if (!field) {
		do {
			field = createNewField();
		} while (field.uncoverCell(row, col).neighbourMineCount !== 0 || field.gameState === gameState.failure)
	} else if (event.which === 1) {
		field.uncoverCell(row, col);
	} else if (event.which === 3) {
		field.flagCell(row, col);
	} else if (event.which === 2) {
		field.uncoverNeighbours(row, col);
	}

	showMineField();

	return false;
}

function showMineField(rows?: number, cols?: number) {
	if (!field) {
		for (var row = 0; row < rows; row++) {
			for (var col = 0; col < cols; col++) {
				$('#cell-' + row + '-' + col).html('');
			}
		}
	} else {
		_.each(field.getMineField(), cell => $('#cell-' + cell.row + '-' + cell.col).html(getCellContent(cell)));
	}
}

function getCellContent(cell: readonlyMineCell): string {
	switch (cell.state) {
		case mineState.covered:
			return '';
		case mineState.uncovered:
			return (cell.neighbourMineCount === 0) ? '_' : cell.neighbourMineCount.toString();
		case mineState.mine:
			return '*';
		case mineState.mineDetonated:
			return '#';
		case mineState.flagged:
			return '@';
		case mineState.incorrectlyFlagged:
			return 'X';
	}
}
