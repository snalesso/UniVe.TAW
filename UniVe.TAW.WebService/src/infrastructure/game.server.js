"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game = require("./game");
var ServerSideBattleFieldCell = /** @class */ (function () {
    function ServerSideBattleFieldCell(shipType, fireReceivedDateTime) {
        if (shipType === void 0) { shipType = game.ShipType.NoShip; }
        if (fireReceivedDateTime === void 0) { fireReceivedDateTime = null; }
        this.ShipType = shipType;
        this._fireReceivedDateTime = fireReceivedDateTime;
    }
    Object.defineProperty(ServerSideBattleFieldCell.prototype, "HasReceivedFire", {
        get: function () {
            return this._fireReceivedDateTime != null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerSideBattleFieldCell.prototype, "FireReceivedDateTime", {
        get: function () {
            return this._fireReceivedDateTime;
        },
        enumerable: true,
        configurable: true
    });
    ServerSideBattleFieldCell.prototype.receiveFire = function () {
        this._fireReceivedDateTime = new Date();
        return this.HasReceivedFire;
    };
    return ServerSideBattleFieldCell;
}());
exports.ServerSideBattleFieldCell = ServerSideBattleFieldCell;
//# sourceMappingURL=game.server.js.map