/// <reference path="underscore.d.ts" />
/// <reference path="Minesweeper.ts" />

class minesweeperSolver {
	private minefield: mineField;

	constructor(mineField: mineField) {
		this.minefield = mineField;
	}

	public playNextStep(): boolean {
		if (this.flagMine()) {
			return true;
		} else if (this.uncoverCells()) {
			return true;
		} else {
			return false;
		}
	}

	private flagMine(): boolean {
		return false;
	}

	private uncoverCells(): boolean {
		return false;
	}
}