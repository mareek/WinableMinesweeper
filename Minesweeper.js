/// <reference path="underscore.d.ts" />
var moveResult;
(function (moveResult) {
    moveResult[moveResult["uncover"] = 0] = "uncover";
    moveResult[moveResult["victory"] = 1] = "victory";
    moveResult[moveResult["failure"] = 2] = "failure";
})(moveResult || (moveResult = {}));
var mineCell = (function () {
    function mineCell(row, col) {
        this.row = row;
        this.col = col;
    }
    mineCell.prototype.isAdjacent = function (other) {
        return other.col >= (this.col - 1)
            && other.col <= (this.col + 1)
            && other.row >= (this.row - 1)
            && other.row <= (this.row + 1);
    };
    return mineCell;
})();
var mineField = (function () {
    function mineField(height, width, mineCount) {
        this.height = height;
        this.width = width;
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
    mineField.prototype.getAllCells = function () {
        return _.flatten(this.grid, true);
    };
    mineField.prototype.fillGrid = function (mineCount) {
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
    };
    mineField.prototype.setCellInfo = function (cell) {
        if (!cell.hasMine) {
            cell.neighbourMineCount = _.filter(this.getAdjacentCells(cell), function (c) { return c.hasMine; }).length;
        }
    };
    mineField.prototype.getAdjacentCells = function (cell) {
        return _.filter(this.getAllCells(), function (c) { return cell.isAdjacent(c); });
    };
    mineField.prototype.uncoverCell = function (row, col) {
        var _this = this;
        var cell = this.grid[row][col];
        if (cell.hasFlag) {
            return moveResult.uncover;
        }
        else {
            cell.isUncovered = true;
            if (cell.hasMine) {
                return moveResult.failure;
            }
            else {
                if (cell.neighbourMineCount === 0) {
                    _.each(this.getAdjacentCells(cell), function (c) { return _this.uncoverCell(cell.row, cell.col); });
                }
                if (_.every(this.getAllCells(), function (c) { return c.hasMine || c.isUncovered; })) {
                    return moveResult.victory;
                }
                else {
                    return moveResult.uncover;
                }
            }
        }
    };
    return mineField;
})();
