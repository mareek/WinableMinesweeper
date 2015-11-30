/// <reference path="underscore.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="Minesweeper.ts" />
var field: mineField;

$(() => {
	$('#easyButton').click(e=> initMineField(9, 9, 10));
	$('#mediumButton').click(e=> initMineField(16, 16, 40));
	$('#hardButton').click(e=> initMineField(16, 30, 99));
});

function initMineField(rows: number, cols: number, mineCount: number) {
	field = null;
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
		click: e => clickCell(row, col, e, createNewField)
	});
}

function clickCell(row: number, col: number, event: JQueryMouseEventObject, createNewField: () => mineField) {
	if (!field) {
		do {
			field = createNewField();
		} while (field.uncoverCell(row, col).neighbourMineCount !== 0 || field.gameState === gameState.failure)
	} else if (event.button === 0) {
		field.uncoverCell(row, col);
	} else if (event.button === 1) {
		field.flagCell(row, col);
	} else if (event.button === 2) {
		field.uncoverNeighbours(row, col);
	}

	showMineField(field.rows, field.cols);
}

function showMineField(rows: number, cols: number) {
	if (!field) {
		for (var row = 0; row < rows; row++) {
			for (var col = 0; col < cols; col++) {
				$('#cell-' + row + '-' + col).html('');
			}
		}
	} else {
		_.each(field.getMineField(), cell => {
			var td = $('#cell-' + cell.row + '-' + cell.col);
			switch (cell.state) {
				case mineState.covered:
					td.html('');
					break;
				case mineState.uncovered:
					td.html((cell.neighbourMineCount === 0) ? '_' : cell.neighbourMineCount.toString());
					break;
				case mineState.mine:
					td.html('*');
					break;
				case mineState.mineDetonated:
					td.html('#');
					break;
				case mineState.flagged:
					td.html('@');
					break;
				case mineState.incorrectlyFlagged:
					td.html('X');
					break;
			}
		});
	}
}
