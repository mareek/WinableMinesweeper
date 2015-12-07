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
			hasMoved = _.some(_.filter(uncoveredCells, cell => this.playEsayMoves(cell, allCells, false)))
						|| this.playHardMoves(uncoveredCells, allCells, false);
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

	private playHardMoves(uncoveredCells: readonlyMineCell[], allCells: readonlyMineCell[], returnOnFirstAction: boolean): boolean {
		var minedZonesById: { [id: string]: minedZone; } = {};
		_.each(uncoveredCells, cell=> {
			var neighbours = this.getAdjacentCells(cell, allCells);
			var flaggedNeighbours = _.filter(neighbours, c=> c.state === mineState.flagged);
			var coveredNeighbours = _.filter(neighbours, c=> c.state === mineState.covered);
			var remainingCount = cell.neighbourMineCount - flaggedNeighbours.length;
			if (remainingCount > coveredNeighbours.length) {
				var zone = new minedZone(remainingCount, coveredNeighbours);
				minedZonesById[zone.id] = zone;
			}
		});

		for (var zoneId in minedZonesById) {
			for (var otherId in minedZonesById) {
				var zone = minedZonesById[zoneId];
				var other = minedZonesById[otherId];
				if (zone.intersect(other)) {
					var otherCellsInZone = _.intersection(zone.cells, other.cells);
					var cellsNotInOtherZone = _.difference(zone.cells, other.cells);
					var mineCountInOtherZone = zone.mineCount - cellsNotInOtherZone.length;
					if (mineCountInOtherZone = other.mineCount) {
						_.each(cellsNotInOtherZone, c=> this.minefield.flagCell(c.row, c.col));
						return true;
					}
				}
			}
		}

		return false;
	}

	private getAdjacentCells(cell: readonlyMineCell, allcells: readonlyMineCell[]): readonlyMineCell[] {
		return _.filter(allcells, c => cell.isAdjacent(c));
	}
}

class minedZone {
	private _id: string;
	get id(): string { return this._id; }

	constructor(public mineCount: number, public cells: readonlyMineCell[]) {
		var ids = _.map(cells, c=> c.id);
		ids.sort();
		this._id = ids.join("¤");
	}

	public intersect(other: minedZone): boolean {
		return other.id !== this._id
			&& _.intersection(_.map(this.cells, c=> c.id), _.map(other.cells, c=> c.id)).length > 0;
	}
}
