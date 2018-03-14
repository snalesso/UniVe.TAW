var UniVe;
(function (UniVe) {
    var TAW;
    (function (TAW) {
        var Framework;
        (function (Framework) {
            var Game;
            (function (Game) {
                var Ship = /** @class */ (function () {
                    function Ship(size) {
                        this.Size = size;
                    }
                    Ship.prototype.IsWrecked = function () {
                        return false;
                    };
                    return Ship;
                }());
                Game.Ship = Ship;
                var Direction;
                (function (Direction) {
                    Direction[Direction["Up"] = 0] = "Up";
                    Direction[Direction["Down"] = 1] = "Down";
                    Direction[Direction["Left"] = 2] = "Left";
                    Direction[Direction["Right"] = 3] = "Right";
                })(Direction = Game.Direction || (Game.Direction = {}));
                var Match = /** @class */ (function () {
                    function Match() {
                    }
                    return Match;
                }());
                Game.Match = Match;
                var Coord = /** @class */ (function () {
                    function Coord(x, y) {
                        this.X = x;
                        this.Y = y;
                    }
                    return Coord;
                }());
                Game.Coord = Coord;
                var PlayerSide = /** @class */ (function () {
                    function PlayerSide() {
                    }
                    PlayerSide.prototype.ReceiveEnemyFire = function (coord) {
                        if (!coord)
                            throw new Error("coord cannot be null");
                    };
                    return PlayerSide;
                }());
                Game.PlayerSide = PlayerSide;
                var Fleet = /** @class */ (function () {
                    function Fleet() {
                    }
                    return Fleet;
                }());
                Game.Fleet = Fleet;
                var Action = /** @class */ (function () {
                    function Action() {
                    }
                    return Action;
                }());
                Game.Action = Action;
            })(Game = Framework.Game || (Framework.Game = {}));
        })(Framework = TAW.Framework || (TAW.Framework = {}));
    })(TAW = UniVe.TAW || (UniVe.TAW = {}));
})(UniVe || (UniVe = {}));
//# sourceMappingURL=Game.js.map