/// <reference path="underscore.d.ts" />
var gameState;
(function (gameState) {
    gameState[gameState["inProgress"] = 0] = "inProgress";
    gameState[gameState["victory"] = 1] = "victory";
    gameState[gameState["failure"] = 2] = "failure";
})(gameState || (gameState = {}));
var mineState;
(function (mineState) {
    mineState[mineState["covered"] = 0] = "covered";
    mineState[mineState["uncovered"] = 1] = "uncovered";
    mineState[mineState["flagged"] = 2] = "flagged";
    mineState[mineState["incorrectlyFlagged"] = 3] = "incorrectlyFlagged";
    mineState[mineState["mine"] = 4] = "mine";
    mineState[mineState["mineDetonated"] = 5] = "mineDetonated";
})(mineState || (mineState = {}));
var mineCell = (function () {
    function mineCell(row, col) {
        this.row = row;
        this.col = col;
        this.neighbourMineCount = 0;
    }
    mineCell.prototype.isAdjacent = function (other) {
        return other.col >= (this.col - 1)
            && other.col <= (this.col + 1)
            && other.row >= (this.row - 1)
            && other.row <= (this.row + 1);
    };
    return mineCell;
})();
var readonlyMineCell = (function () {
    function readonlyMineCell(cell, currentGameState) {
        this._row = cell.row;
        this._col = cell.col;
        this._neighbourMineCount = cell.neighbourMineCount;
        if (cell.isUncovered && !cell.hasMine) {
            this._state = mineState.uncovered;
        }
        else if (cell.hasMine && cell.isUncovered) {
            this._state = mineState.mineDetonated;
        }
        else if (currentGameState === gameState.inProgress && cell.hasFlag) {
            this._state = mineState.flagged;
        }
        else if (currentGameState !== gameState.inProgress && cell.hasMine) {
            this._state = mineState.mine;
        }
        else if (currentGameState === gameState.failure && cell.hasFlag && !cell.hasMine) {
            this._state = mineState.incorrectlyFlagged;
        }
        else {
            this._state = mineState.covered;
        }
    }
    Object.defineProperty(readonlyMineCell.prototype, "row", {
        get: function () { return this._row; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(readonlyMineCell.prototype, "col", {
        get: function () { return this._col; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(readonlyMineCell.prototype, "neighbourMineCount", {
        get: function () { return this._neighbourMineCount; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(readonlyMineCell.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    return readonlyMineCell;
})();
var mineField = (function () {
    function mineField(rows, cols, mineCount) {
        var _this = this;
        this.rows = rows;
        this.cols = cols;
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
            .where(function (c) { return !c.hasMine; })
            .each(function (cell) { return cell.neighbourMineCount = _.filter(_this.getAdjacentCells(cell), function (c) { return c.hasMine; }).length; });
    }
    Object.defineProperty(mineField.prototype, "gameState", {
        get: function () { return this._gameState; },
        enumerable: true,
        configurable: true
    });
    mineField.prototype.fillGrid = function (mineCount) {
        var actualMineCount = 0;
        while (actualMineCount < mineCount) {
            var row = Math.floor(Math.random() * this.rows);
            var col = Math.floor(Math.random() * this.cols);
            var cell = this.grid[row][col];
            if (!cell.hasMine) {
                cell.hasMine = true;
                actualMineCount++;
            }
        }
    };
    mineField.prototype.getAllCells = function () {
        return _.flatten(this.grid, true);
    };
    mineField.prototype.getAdjacentCells = function (cell) {
        return _.filter(this.getAllCells(), function (c) { return cell.isAdjacent(c); });
    };
    mineField.prototype.getMineField = function () {
        var _this = this;
        return _.map(this.getAllCells(), function (c) { return new readonlyMineCell(c, _this._gameState); });
    };
    mineField.prototype.getMineCell = function (row, col) {
        return new readonlyMineCell(this.grid[row][col], this._gameState);
    };
    mineField.prototype.flagCell = function (row, col) {
        var cell = this.grid[row][col];
        cell.hasFlag = !cell.hasFlag;
    };
    mineField.prototype.uncoverCell = function (row, col) {
        var _this = this;
        var cell = this.grid[row][col];
        if (cell.hasFlag || cell.isUncovered) {
            return new readonlyMineCell(cell, this._gameState);
        }
        cell.isUncovered = true;
        if (cell.hasMine) {
            this._gameState = gameState.failure;
        }
        else {
            if (cell.neighbourMineCount === 0) {
                _.each(this.getAdjacentCells(cell), function (c) { return _this.uncoverCell(c.row, c.col); });
            }
            if (_.every(this.getAllCells(), function (c) { return c.hasMine || c.isUncovered; })) {
                this._gameState = gameState.victory;
            }
        }
        return new readonlyMineCell(cell, this._gameState);
    };
    mineField.prototype.uncoverNeighbours = function (row, col) {
        var _this = this;
        var cell = this.grid[row][col];
        var adjacentcells = this.getAdjacentCells(cell);
        if (!cell.hasFlag && _.filter(adjacentcells, function (c) { return c.hasFlag; }).length === cell.neighbourMineCount) {
            _.each(adjacentcells, function (c) { return _this.uncoverCell(c.row, c.col); });
        }
    };
    return mineField;
})();
