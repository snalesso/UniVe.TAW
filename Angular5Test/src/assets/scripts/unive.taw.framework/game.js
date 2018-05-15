"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ship = /** @class */ (function () {
    function Ship(size) {
        this.Size = size;
    }
    Ship.prototype.IsWrecked = function () {
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
var Match = /** @class */ (function () {
    function Match() {
    }
    return Match;
}());
exports.Match = Match;
var Coord = /** @class */ (function () {
    function Coord(x, y) {
        this.X = x;
        this.Y = y;
    }
    return Coord;
}());
exports.Coord = Coord;
var PlayerSide = /** @class */ (function () {
    function PlayerSide() {
    }
    PlayerSide.prototype.ReceiveEnemyFire = function (coord) {
        if (!coord)
            throw new Error("coord cannot be null");
    };
    return PlayerSide;
}());
exports.PlayerSide = PlayerSide;
var Fleet = /** @class */ (function () {
    function Fleet() {
    }
    return Fleet;
}());
exports.Fleet = Fleet;
var Action = /** @class */ (function () {
    function Action() {
    }
    return Action;
}());
exports.Action = Action;
