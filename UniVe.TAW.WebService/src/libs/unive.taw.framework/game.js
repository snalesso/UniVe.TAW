"use strict";
//import * as Observable from 'rxjs/Observable';
Object.defineProperty(exports, "__esModule", { value: true });
var Ship = /** @class */ (function () {
    function Ship() {
    }
    Ship.prototype.isWrecked = function () {
        return false;
    };
    return Ship;
}());
exports.Ship = Ship;
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction = exports.Direction || (exports.Direction = {}));
var Coord = /** @class */ (function () {
    function Coord(x, y) {
        if (x < 0
            || x >= BattleField.Width
            || y < 0
            || y >= BattleField.Height)
            throw new Error("Invalid coords!");
        this.X = x;
        this.Y = y;
    }
    return Coord;
}());
exports.Coord = Coord;
var BattleFieldCell = /** @class */ (function () {
    function BattleFieldCell() {
    }
    return BattleFieldCell;
}());
exports.BattleFieldCell = BattleFieldCell;
var BattleField = /** @class */ (function () {
    function BattleField() {
        this._isLocked = true;
    }
    BattleField.prototype.ReceiveEnemyFire = function (coord) {
        if (!coord)
            throw new Error("coord cannot be null");
    };
    Object.defineProperty(BattleField.prototype, "isLocked", {
        get: function () { return this._isLocked; },
        enumerable: true,
        configurable: true
    });
    // TODO: move to server side
    BattleField.Height = 8;
    BattleField.Width = 8;
    return BattleField;
}());
exports.BattleField = BattleField;
var Action = /** @class */ (function () {
    function Action() {
    }
    return Action;
}());
exports.Action = Action;
var MatchPhase = /** @class */ (function () {
    function MatchPhase() {
    }
    return MatchPhase;
}());
exports.MatchPhase = MatchPhase;
//# sourceMappingURL=game.js.map