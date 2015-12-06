/// <reference path="underscore.d.ts" />
/// <reference path="Minesweeper.ts" />

class minesweeperSolver {
	private minefield: mineField;

	constructor(mineField: mineField) {
		this.minefield = mineField;
	}

	public playNextStep(): boolean {
		var allCells = _.values(_.shuffle(this.minefield.getMineField()));
		var uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered)
		return _.some(uncoveredCells, cell => this.playEsayMoves(cell, allCells, true));
	}

	public uncoverGrid() {
		var hasMoved = false;
		do {
			var allCells = this.minefield.getMineField();
			var uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered)
			hasMoved = _.some(uncoveredCells, cell => this.playEsayMoves(cell, allCells, false));
		} while (hasMoved)
	}

	private playEsayMoves(cell: readonlyMineCell, allCells: readonlyMineCell[], returnOnFirstAction: boolean): boolean {
		var result = false;
		var neighbours = this.getAdjacentCells(cell, allCells);
		var flaggedNeighbours = _.filter(neighbours, c=> c.state === mineState.flagged);
		var coveredNeighbours = _.filter(neighbours, c=> c.state === mineState.covered);

		if (coveredNeighbours.length > 0 && cell.neighbourMineCount === (flaggedNeighbours.length + coveredNeighbours.length)) {
			for (var i = 0; i < coveredNeighbours.length && !(result && returnOnFirstAction); i++) {
				var cellToFlag = coveredNeighbours[i];
				this.minefield.flagCell(cellToFlag.row, cellToFlag.col);
				result = true;
			}
		} else if (coveredNeighbours.length > 0 && cell.neighbourMineCount === flaggedNeighbours.length) {
			for (var i = 0; i < coveredNeighbours.length && !(result && returnOnFirstAction); i++) {
				var cellToUncover = coveredNeighbours[i];
				this.minefield.uncoverCell(cellToUncover.row, cellToUncover.col);
				result = true;
			}
		}

		return result;
	}

	private getAdjacentCells(cell: readonlyMineCell, allcells: readonlyMineCell[]): readonlyMineCell[] {
		return _.filter(allcells, c => cell.isAdjacent(c));
	}
}