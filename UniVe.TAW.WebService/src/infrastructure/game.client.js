"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OwnBattleFieldCellStatus;
(function (OwnBattleFieldCellStatus) {
    OwnBattleFieldCellStatus[OwnBattleFieldCellStatus["Untouched"] = 0] = "Untouched";
    OwnBattleFieldCellStatus[OwnBattleFieldCellStatus["Hit"] = 1] = "Hit";
})(OwnBattleFieldCellStatus = exports.OwnBattleFieldCellStatus || (exports.OwnBattleFieldCellStatus = {}));
var EnemyBattleFieldCellStatus;
(function (EnemyBattleFieldCellStatus) {
    EnemyBattleFieldCellStatus[EnemyBattleFieldCellStatus["Unknown"] = 0] = "Unknown";
    EnemyBattleFieldCellStatus[EnemyBattleFieldCellStatus["Water"] = 1] = "Water";
    EnemyBattleFieldCellStatus[EnemyBattleFieldCellStatus["Hit"] = 2] = "Hit";
})(EnemyBattleFieldCellStatus = exports.EnemyBattleFieldCellStatus || (exports.EnemyBattleFieldCellStatus = {}));
// used to organize ships, generates the readonly battlefield side
var BattleFieldConfigurator = /** @class */ (function () {
    function BattleFieldConfigurator(Width, Height, availableShips) {
        var _this = this;
        this.Width = Width;
        this.Height = Height;
        this._avShips = {};
        if (this.Height <= 0 || this.Width <= 0)
            throw new Error("Invalid battle field size!");
        if (availableShips == null || availableShips.length <= 0)
            throw new Error("Cannot play a match without ships!");
        this._availableShips = availableShips;
        this._availableShips.forEach(function (sa) { return _this._avShips[sa.ShipType] = sa.Count; });
    }
    BattleFieldConfigurator.prototype.canPlaceShipOfType = function (type) {
        return (this._avShips[type] > 0);
    };
    BattleFieldConfigurator.prototype.placeShip = function (type, coord) {
        if (this._avShips[type] <= 0)
            throw new Error("There are no ships of type " + type.toString() + " to place!");
        if (coord.X < 0 || coord.X > this.Width || coord.Y < this.Height || coord.Y > this.Height) {
            throw new Error("Coord is outside battle field boundaries!");
        }
        this._avShips[type]--;
    };
    return BattleFieldConfigurator;
}());
exports.BattleFieldConfigurator = BattleFieldConfigurator;
//# sourceMappingURL=game.client.js.map