"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game = require("./game");
var ClientSideBattleFieldCellStatus_Owner;
(function (ClientSideBattleFieldCellStatus_Owner) {
    ClientSideBattleFieldCellStatus_Owner[ClientSideBattleFieldCellStatus_Owner["Water"] = 0] = "Water";
    ClientSideBattleFieldCellStatus_Owner[ClientSideBattleFieldCellStatus_Owner["Ship"] = 1] = "Ship";
    ClientSideBattleFieldCellStatus_Owner[ClientSideBattleFieldCellStatus_Owner["Hit"] = 2] = "Hit";
})(ClientSideBattleFieldCellStatus_Owner = exports.ClientSideBattleFieldCellStatus_Owner || (exports.ClientSideBattleFieldCellStatus_Owner = {}));
var ClientSideBattleFieldCellStatus_Enemy;
(function (ClientSideBattleFieldCellStatus_Enemy) {
    ClientSideBattleFieldCellStatus_Enemy[ClientSideBattleFieldCellStatus_Enemy["Unknown"] = 0] = "Unknown";
    ClientSideBattleFieldCellStatus_Enemy[ClientSideBattleFieldCellStatus_Enemy["Water"] = 1] = "Water";
    ClientSideBattleFieldCellStatus_Enemy[ClientSideBattleFieldCellStatus_Enemy["Hit"] = 2] = "Hit";
})(ClientSideBattleFieldCellStatus_Enemy = exports.ClientSideBattleFieldCellStatus_Enemy || (exports.ClientSideBattleFieldCellStatus_Enemy = {}));
var ClientSideBattleFieldCell_Owner = /** @class */ (function () {
    function ClientSideBattleFieldCell_Owner(ShipType, Status) {
        if (Status === void 0) { Status = ClientSideBattleFieldCellStatus_Owner.Water; }
        this.ShipType = ShipType;
        this.Status = Status;
        if (this.ShipType != game.ShipType.NoShip
            && this.Status == ClientSideBattleFieldCellStatus_Owner.Water)
            throw new Error("A cell with a ship cannot be marked as a miss");
        if (this.ShipType == game.ShipType.NoShip
            && this.Status != ClientSideBattleFieldCellStatus_Owner.Water)
            throw new Error("A cell with no ships cannot be hit");
    }
    return ClientSideBattleFieldCell_Owner;
}());
exports.ClientSideBattleFieldCell_Owner = ClientSideBattleFieldCell_Owner;
var ClientSideBattleFieldCell_Enemy = /** @class */ (function () {
    function ClientSideBattleFieldCell_Enemy(Status) {
        if (Status === void 0) { Status = ClientSideBattleFieldCellStatus_Enemy.Unknown; }
        this.Status = Status;
        //if (this.ShipType != game.ShipType.NoShip)
    }
    return ClientSideBattleFieldCell_Enemy;
}());
exports.ClientSideBattleFieldCell_Enemy = ClientSideBattleFieldCell_Enemy;
// used to organiza ships, generates the readonly battlefield side
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
    BattleFieldConfigurator.prototype.getFinalBattlefield = function () {
    };
    return BattleFieldConfigurator;
}());
exports.BattleFieldConfigurator = BattleFieldConfigurator;
//# sourceMappingURL=game.client.js.map