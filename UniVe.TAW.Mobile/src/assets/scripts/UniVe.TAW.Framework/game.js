var unive;
(function (unive) {
    var taw;
    (function (taw) {
        var framework;
        (function (framework) {
            var game;
            (function (game) {
                var Ship = /** @class */ (function () {
                    function Ship(size) {
                        this.Size = size;
                    }
                    Ship.prototype.IsWrecked = function () {
                        return false;
                    };
                    return Ship;
                }());
                game.Ship = Ship;
                var Direction;
                (function (Direction) {
                    Direction[Direction["Up"] = 0] = "Up";
                    Direction[Direction["Down"] = 1] = "Down";
                    Direction[Direction["Left"] = 2] = "Left";
                    Direction[Direction["Right"] = 3] = "Right";
                })(Direction = game.Direction || (game.Direction = {}));
                var Match = /** @class */ (function () {
                    function Match() {
                    }
                    return Match;
                }());
                game.Match = Match;
                var Coord = /** @class */ (function () {
                    function Coord(x, y) {
                        this.X = x;
                        this.Y = y;
                    }
                    return Coord;
                }());
                game.Coord = Coord;
                var PlayerSide = /** @class */ (function () {
                    function PlayerSide() {
                    }
                    PlayerSide.prototype.ReceiveEnemyFire = function (coord) {
                        if (!coord)
                            throw new Error("coord cannot be null");
                    };
                    return PlayerSide;
                }());
                game.PlayerSide = PlayerSide;
                var Fleet = /** @class */ (function () {
                    function Fleet() {
                    }
                    return Fleet;
                }());
                game.Fleet = Fleet;
                var Action = /** @class */ (function () {
                    function Action() {
                    }
                    return Action;
                }());
                game.Action = Action;
            })(game = framework.game || (framework.game = {}));
        })(framework = taw.framework || (taw.framework = {}));
    })(taw = unive.taw || (unive.taw = {}));
})(unive || (unive = {}));
