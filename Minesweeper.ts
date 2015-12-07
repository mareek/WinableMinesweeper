/// <reference path="underscore.d.ts" />

enum gameState {
	inProgress,
	victory,
	failure
}

enum mineState {
	covered,
	uncovered,
	flagged,
	incorrectlyFlagged,
	mine,
	mineDetonated
}

class mineCell {
	hasMine: boolean;
	neighbourMineCount: number;
	hasFlag: boolean;
	isUncovered: boolean;

	constructor(public row: number, public col: number) {
		this.neighbourMineCount = 0;
	}

	isAdjacent(other: mineCell): boolean {
		return other.col >= (this.col - 1)
			&& other.col <= (this.col + 1)
			&& other.row >= (this.row - 1)
			&& other.row <= (this.row + 1);
	}
}

class readonlyMineCell {
	private _row: number;
	get row(): number { return this._row; }

	private _col: number;
	get col(): number { return this._col; }

	get id(): string { return this._row + "¤" + this._col; }

	private _neighbourMineCount: number;
	get neighbourMineCount(): number { return this._neighbourMineCount; }

	private _state: mineState;
	get state(): mineState { return this._state; }

	constructor(cell: mineCell, currentGameState: gameState) {
		this._row = cell.row;
		this._col = cell.col;
		this._neighbourMineCount = cell.neighbourMineCount;

		if (cell.isUncovered && !cell.hasMine) {
			this._state = mineState.uncovered
		} else if (cell.hasMine && cell.isUncovered) {
			this._state = mineState.mineDetonated;
		} else if (currentGameState === gameState.inProgress && cell.hasFlag) {
			this._state = mineState.flagged;
		} else if (currentGameState !== gameState.inProgress && cell.hasMine) {
			this._state = mineState.mine;
		} else if (currentGameState === gameState.failure && cell.hasFlag && !cell.hasMine) {
			this._state = mineState.incorrectlyFlagged;
		} else {
			this._state = mineState.covered;
		}
	}

	isAdjacent(other: readonlyMineCell): boolean {
		return other.col >= (this.col - 1)
			&& other.col <= (this.col + 1)
			&& other.row >= (this.row - 1)
			&& other.row <= (this.row + 1);
	}
}

class mineField {
	private grid: mineCell[][]; // Indexed by [rows][columns]
	
	private _gameState: gameState;
	public get gameState(): gameState { return this._gameState; }

	constructor(public rows: number, public cols: number, mineCount: number) {
		this._gameState = gameState.inProgress;
		this.grid = [];
		for (var row = 0; row < rows; row++) {
			this.grid[row] = [];
			for (var col = 0; col < cols; col++) {
				this.grid[row][col] = new mineCell(row, col);
			}
		}

		this.fillGrid(mineCount);

		_.chain(this.getAllCells())
			.where(c => !c.hasMine)
			.each(cell => cell.neighbourMineCount = _.filter(this.getAdjacentCells(cell), c => c.hasMine).length);
	}

	private fillGrid(mineCount: number) {
		var actualMineCount = 0;
		while (actualMineCount < mineCount) {
			var row = _.random(this.rows - 1);
			var col = _.random(this.cols - 1);
			var cell = this.grid[row][col];
			if (!cell.hasMine) {
				cell.hasMine = true;
				actualMineCount++;
			}
		}
	}

	private getAllCells(): mineCell[] {
		return _.flatten(this.grid, true);
	}

	private getAdjacentCells(cell: mineCell): mineCell[] {
		return _.filter(this.getAllCells(), c => cell.isAdjacent(c));
	}

	public getSafeStart(): readonlyMineCell {
		return _.chain(this.getAllCells())
			.filter(c=> !c.hasMine && c.neighbourMineCount === 0)
			.map(c=> new readonlyMineCell(c, this._gameState))
			.shuffle()
			.first()
			.value();
	}

	public getMineField(): readonlyMineCell[] {
		return _.map(this.getAllCells(), c=> new readonlyMineCell(c, this._gameState));
	}

	public flagCell(row: number, col: number) {
		var cell = this.grid[row][col];
		cell.hasFlag = !cell.hasFlag;
	}

	public uncoverCell(row: number, col: number): readonlyMineCell {
		var cell = this.grid[row][col];
		if (cell.hasFlag || cell.isUncovered) {
			return new readonlyMineCell(cell, this._gameState);
		}

		cell.isUncovered = true;
		if (cell.hasMine) {
			this._gameState = gameState.failure;
		} else {
			if (cell.neighbourMineCount === 0) {
				_.each(this.getAdjacentCells(cell), c => this.uncoverCell(c.row, c.col));
			}

			if (_.every(this.getAllCells(), c => c.hasMine || c.isUncovered)) {
				this._gameState = gameState.victory;
			}
		}

		return new readonlyMineCell(cell, this._gameState);
	}

	public uncoverNeighbours(row: number, col: number) {
		var cell = this.grid[row][col];
		var adjacentcells = this.getAdjacentCells(cell);
		if (!cell.hasFlag && _.filter(adjacentcells, c => c.hasFlag).length === cell.neighbourMineCount) {
			_.each(adjacentcells, c => this.uncoverCell(c.row, c.col));
		}
	}
}