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
	$('#autoplayButton').click(() => autoplay());
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

function autoplay() {
	if (solver && field.gameState === gameState.inProgress && solver.playNextStep()) {
		showMineField();
		window.setTimeout(autoplay, 100);
	}
}

function clickCell(row: number, col: number, event: JQueryMouseEventObject, createNewField: () => mineField) {
	if (!field) {
		do {
			field = createNewField();
			solver = new minesweeperSolver(field);
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
				showCell(row, col, getCellContent(mineState.covered, 0));
			}
		}
	} else {
		_.each(field.getMineField(), cell => showCell(cell.row, cell.col, getCellContent(cell.state, cell.neighbourMineCount)));
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
