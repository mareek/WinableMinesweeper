/// <reference path="underscore.d.ts" />
/// <reference path="Minesweeper.ts" />

class MinesweeperSolver {
    private minefield: MineField;

    constructor(mineField: MineField) {
        this.minefield = mineField;
    }

    public playNextStep(): boolean {
        const allCells = _.values(_.shuffle(this.minefield.getVisibleField()));
        const uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered);
        return _.some(uncoveredCells, cell => this.playEsayMoves(cell, allCells, true))
            || this.playHardMoves(uncoveredCells, allCells, true);
    }

    public uncoverGrid() {
        let hasMoved = false;
        do {
            var allCells = this.minefield.getVisibleField();
            const uncoveredCells = _.filter(allCells, c => c.state === mineState.uncovered);
            hasMoved = _.some(_.filter(uncoveredCells, cell => this.playEsayMoves(cell, allCells, false)))
                || this.playHardMoves(uncoveredCells, allCells, false);
        } while (hasMoved && this.minefield.gameState === gameState.inProgress);
    }

    private playEsayMoves(cell: VisibleCell, allCells: VisibleCell[], returnOnFirstAction: boolean): boolean {
        let result = false;
        let neighbours = this.getAdjacentCells(cell, allCells);
        let flaggedNeighbours = _.filter(neighbours, c => c.state === mineState.flagged);
        let coveredNeighbours = _.filter(neighbours, c => c.state === mineState.covered);

        if (coveredNeighbours.length > 0 && cell.neighbourMineCount === (flaggedNeighbours.length + coveredNeighbours.length)) {
            for (let i = 0; i < coveredNeighbours.length && !(result && returnOnFirstAction); i++) {
                const cellToFlag = coveredNeighbours[i];
                this.minefield.forceFlagOnCell(cellToFlag.row, cellToFlag.col);
                result = true;
            }
        } else if (coveredNeighbours.length > 0 && cell.neighbourMineCount === flaggedNeighbours.length) {
            for (let i = 0; i < coveredNeighbours.length && !(result && returnOnFirstAction); i++) {
                const cellToUncover = coveredNeighbours[i];
                this.minefield.uncoverCell(cellToUncover.row, cellToUncover.col);
                result = true;
            }
        }

        return result;
    }

    private playHardMoves(uncoveredCells: VisibleCell[], allCells: VisibleCell[], returnOnFirstAction: boolean): boolean {
        let minedZonesById: { [id: string]: MinedZone; } = {};
        _.each(uncoveredCells, cell => {
            const neighbours = this.getAdjacentCells(cell, allCells);
            const flaggedNeighbours = _.filter(neighbours, c => c.state === mineState.flagged);
            const coveredNeighbours = _.filter(neighbours, c => c.state === mineState.covered);
            const remainingCount = cell.neighbourMineCount - flaggedNeighbours.length;
            if (remainingCount > 0 && remainingCount < coveredNeighbours.length) {
                const zone = new MinedZone(remainingCount, coveredNeighbours);
                minedZonesById[zone.id] = zone;
            }
        });

        for (let zoneId in minedZonesById) {
            for (let otherId in minedZonesById) {
                const zone = minedZonesById[zoneId];
                const other = minedZonesById[otherId];
                if (zone.intersect(other)) {
                    const cellsNotInOtherZone = _.difference(zone.cells, other.cells);
                    const mineCountInOtherZone = zone.mineCount - cellsNotInOtherZone.length;
                    if (mineCountInOtherZone === other.mineCount && cellsNotInOtherZone.length > 0) {
                        if (returnOnFirstAction) {
                            this.minefield.forceFlagOnCell(cellsNotInOtherZone[0].row, cellsNotInOtherZone[0].col);
                        } else {
                            _.each(cellsNotInOtherZone, c => this.minefield.forceFlagOnCell(c.row, c.col));
                        }
                        return true;
                    }

                    const otherCellsNotInZone = _.difference(other.cells, zone.cells);
                    const otherMineCountInZone = other.mineCount - otherCellsNotInZone.length;
                    if (otherMineCountInZone === zone.mineCount && cellsNotInOtherZone.length > 0) {
                        if (returnOnFirstAction) {
                            this.minefield.uncoverCell(cellsNotInOtherZone[0].row, cellsNotInOtherZone[0].col);
                        } else {
                            _.each(cellsNotInOtherZone, c => this.minefield.uncoverCell(c.row, c.col));
                        }
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private getAdjacentCells(cell: VisibleCell, allcells: VisibleCell[]): VisibleCell[] {
        return _.filter(allcells, c => cell.isAdjacent(c));
    }
}

class MinedZone {
    private _id: string;
    get id(): string { return this._id; }

    constructor(public mineCount: number, public cells: VisibleCell[]) {
        let ids = _.map(cells, c => c.id);
        ids.sort();
        this._id = ids.join("¤");
    }

    public intersect(other: MinedZone): boolean {
        return other.id !== this._id
            && _.intersection(_.map(this.cells, c => c.id), _.map(other.cells, c => c.id)).length > 0;
    }
}
