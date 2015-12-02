/// <reference path="underscore.d.ts" />
/// <reference path="Minesweeper.ts" />

class minesweeperSolver {
	private minefield: mineField;

	constructor(mineField: mineField) {
		this.minefield = mineField;
	}

	public playNextStep(): boolean {
		return this.plantOneFlag()
			|| this.uncoverOneCell();
	}

	private plantOneFlag(): boolean {
		var allCells = this.minefield.getMineField();
		var uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered)
		return _.some(uncoveredCells, cell => {
			var neighbours = this.getAdjacentCells(cell, allCells);
			var flaggedNeighbours = _.filter(neighbours, c=> c.state === mineState.flagged);
			var coveredNeighbours = _.filter(neighbours, c=> c.state === mineState.covered);
			if (coveredNeighbours.length > 0 && cell.neighbourMineCount === (flaggedNeighbours.length + coveredNeighbours.length)) {
				var cellToFlag = coveredNeighbours[0]
				this.minefield.flagCell(cellToFlag.row, cellToFlag.col);
				return true;
			} else {
				return false;
			}
		});
	}

	private uncoverOneCell(): boolean {
		var allCells = this.minefield.getMineField();
		var uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered)
		return _.some(uncoveredCells, cell => {
			var neighbours = this.getAdjacentCells(cell, allCells);
			var flaggedNeighbours = _.filter(neighbours, c=> c.state === mineState.flagged);
			var coveredNeighbours = _.filter(neighbours, c=> c.state === mineState.covered);
			if (coveredNeighbours.length > 0 && cell.neighbourMineCount === flaggedNeighbours.length) {
				var cellToUncover = coveredNeighbours[0]
				this.minefield.uncoverCell(cellToUncover.row, cellToUncover.col);
				return true;
			} else {
				return false;
			}
		});
	}

	private getAdjacentCells(cell: readonlyMineCell, allcells: readonlyMineCell[]): readonlyMineCell[] {
		return _.filter(allcells, c => cell.isAdjacent(c));
	}
}