var Ship = /** @class */ (function () {
    function Ship(size) {
        this.Size = size;
    }
    Ship.prototype.IsWrecked = function () {
        return false;
    };
    return Ship;
}());
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
var Match = /** @class */ (function () {
    function Match() {
    }
    return Match;
}());
var Coord = /** @class */ (function () {
    function Coord(x, y) {
        this.X = x;
        this.Y = y;
    }
    return Coord;
}());
var PlayerSide = /** @class */ (function () {
    function PlayerSide() {
    }
    PlayerSide.prototype.ReceiveEnemyFire = function (coord) {
        if (!coord)
            throw new Error("coord cannot be null");
    };
    return PlayerSide;
}());
var Fleet = /** @class */ (function () {
    function Fleet() {
    }
    return Fleet;
}());
var Action = /** @class */ (function () {
    function Action() {
    }
    return Action;
}());
