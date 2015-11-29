/// <reference path="underscore.d.ts" />

enum moveResult {
	uncover,
	victory,
	failure
}

class mineCell {
	hasMine: boolean;
	neighbourMineCount: number;
	hasFlag: boolean;
	isUncovered: boolean;

	constructor(public row: number, public col: number) { }

	isAdjacent(other: mineCell): boolean {
		return other.col >= (this.col - 1)
			&& other.col <= (this.col + 1)
			&& other.row >= (this.row - 1)
			&& other.row <= (this.row + 1);
	}
}

class mineField {
	private grid: mineCell[][]; // Indexed by [rows][columns]
	
	constructor(public height: number, public width: number, mineCount: number) {
		this.grid = [];
		for (var row = 0; row < height; row++) {
			this.grid[row] = [];
			for (var col = 0; col < width; col++) {
				this.grid[row][col] = new mineCell(row, col);
			}
		}

		this.fillGrid(mineCount);
		_.each(this.getAllCells(), this.setCellInfo);
	}

	private getAllCells(): mineCell[] {
		return _.flatten(this.grid, true);
	}

	private fillGrid(mineCount: number) {
		var actualMineCount = 0;
		while (actualMineCount < mineCount) {
			var row = Math.floor(Math.random() * this.height);
			var col = Math.floor(Math.random() * this.width);
			var cell = this.grid[row][col];
			if (!cell.hasMine) {
				cell.hasMine = true;
				actualMineCount++;
			}
		}
	}

	private setCellInfo(cell: mineCell) {
		if (!cell.hasMine) {
			cell.neighbourMineCount = _.filter(this.getAdjacentCells(cell), c => c.hasMine).length;
		}
	}

	private getAdjacentCells(cell: mineCell): mineCell[] {
		return _.filter(this.getAllCells(), c => cell.isAdjacent(c));
	}

	public uncoverCell(row: number, col: number): moveResult {
		var cell = this.grid[row][col];

		if (cell.hasFlag) {
			return moveResult.uncover;
		} else {
			cell.isUncovered = true;
			if (cell.hasMine) {
				return moveResult.failure;
			} else {
				if (cell.neighbourMineCount === 0) {
					_.each(this.getAdjacentCells(cell), c => this.uncoverCell(cell.row, cell.col));
				}

				if (_.every(this.getAllCells(), c => c.hasMine || c.isUncovered)) {
					return moveResult.victory;
				} else {
					return moveResult.uncover;
				}
			}
		}
	}
	
	public flagCell(row: number, col: number) {
		var cell = this.grid[row][col];
		cell.hasFlag = !cell.hasFlag;		
	}
}