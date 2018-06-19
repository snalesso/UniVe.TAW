"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Ship = /** @class */ (function () {
    function Ship(id) {
        this.id = id;
    }
    Ship.prototype.isWrecked = function () {
        return false;
    };
    return Ship;
}());
exports.Ship = Ship;
var Cacciatorpediniere = /** @class */ (function (_super) {
    __extends(Cacciatorpediniere, _super);
    function Cacciatorpediniere() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 2;
        return _this;
    }
    return Cacciatorpediniere;
}(Ship));
exports.Cacciatorpediniere = Cacciatorpediniere;
var Sottomarino = /** @class */ (function (_super) {
    __extends(Sottomarino, _super);
    function Sottomarino() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 3;
        return _this;
    }
    return Sottomarino;
}(Ship));
exports.Sottomarino = Sottomarino;
var Corazzata = /** @class */ (function (_super) {
    __extends(Corazzata, _super);
    function Corazzata() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 4;
        return _this;
    }
    return Corazzata;
}(Ship));
exports.Corazzata = Corazzata;
var Portaerei = /** @class */ (function (_super) {
    __extends(Portaerei, _super);
    function Portaerei() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 5;
        return _this;
    }
    return Portaerei;
}(Ship));
exports.Portaerei = Portaerei;
var ShipOrientation;
(function (ShipOrientation) {
    ShipOrientation[ShipOrientation["Horizontal"] = 0] = "Horizontal";
    ShipOrientation[ShipOrientation["Vertical"] = 1] = "Vertical";
})(ShipOrientation = exports.ShipOrientation || (exports.ShipOrientation = {}));
var Coord = /** @class */ (function () {
    function Coord(x, y) {
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
var ShipPositionValidator = /** @class */ (function () {
    function ShipPositionValidator() {
    }
    return ShipPositionValidator;
}());
exports.ShipPositionValidator = ShipPositionValidator;
// TODO: enrich rules combinations checks
var MatchSettings = /** @class */ (function () {
    function MatchSettings(battleFieldWidth, battleFieldHeight, cacciatorpedinieri, sottomarini, corazzate, portaerei) {
        if (battleFieldWidth === void 0) { battleFieldWidth = 10; }
        if (battleFieldHeight === void 0) { battleFieldHeight = 10; }
        if (cacciatorpedinieri === void 0) { cacciatorpedinieri = 4; }
        if (sottomarini === void 0) { sottomarini = 2; }
        if (corazzate === void 0) { corazzate = 2; }
        if (portaerei === void 0) { portaerei = 1; }
        this.battleFieldWidth = battleFieldWidth;
        this.battleFieldHeight = battleFieldHeight;
        this.cacciatorpedinieri = cacciatorpedinieri;
        this.sottomarini = sottomarini;
        this.corazzate = corazzate;
        this.portaerei = portaerei;
        if (this.battleFieldHeight <= 0
            || this.battleFieldHeight <= 0
            || this.battleFieldWidth < MatchSettings.battleFieldMinWidth
            || this.battleFieldHeight < MatchSettings.battleFieldMinHeight)
            throw new Error("invalid BattleField size");
        var shipQs = new Array(cacciatorpedinieri, sottomarini, corazzate, portaerei);
        if (!shipQs.every(function (sq) { return sq >= 0; })
            || shipQs.some(function (sq) { return sq < 0; }))
            throw new Error("Invalid ships quantities!");
    }
    MatchSettings.battleFieldMinWidth = 10;
    MatchSettings.battleFieldMinHeight = 10;
    return MatchSettings;
}());
exports.MatchSettings = MatchSettings;
var ShipCoordMapping = /** @class */ (function () {
    function ShipCoordMapping(ship, coord) {
        this.ship = ship;
        this.coord = coord;
    }
    return ShipCoordMapping;
}());
exports.ShipCoordMapping = ShipCoordMapping;
// used to organiza ships, generates the readonly battlefield side
var BattleFieldPreparator = /** @class */ (function () {
    function BattleFieldPreparator() {
    }
    return BattleFieldPreparator;
}());
exports.BattleFieldPreparator = BattleFieldPreparator;
var BattleFieldSide = /** @class */ (function () {
    function BattleFieldSide(playerId, width, height, ships) {
        this.playerId = playerId;
        this.width = width;
        this.height = height;
        this.ships = ships;
        this._isLocked = true;
        this.cells = new BattleFieldCell[this.width][this.height];
        this.shipsMappings = new ShipCoordMapping[this.ships.length];
    }
    BattleFieldSide.prototype.placeShip = function (ship, coord, orientation) {
        var currentMapping = this.shipsMappings.filter(function (sm) { return sm.ship == ship; });
    };
    BattleFieldSide.prototype.receiveEnemyFire = function (coord) {
        if (!this.isValidCoord(coord))
            throw new Error("coord is outside battlefield boundaries");
    };
    // TODO: should check coord != undefined too???
    BattleFieldSide.prototype.isValidCoord = function (coord) {
        return coord
            && coord != undefined
            && coord.X >= 0
            && coord.X < this.width
            && coord.Y >= 0
            && coord.Y < this.height;
    };
    Object.defineProperty(BattleFieldSide.prototype, "isLocked", {
        get: function () { return this._isLocked; },
        enumerable: true,
        configurable: true
    });
    return BattleFieldSide;
}());
exports.BattleFieldSide = BattleFieldSide;
var Match /*implements IMatch*/ = /** @class */ (function () {
    function Match(settings, firstPlayerId, secondPlayerId) {
        // TODO: spostare assegnazioni ID dentro battle field, perchè l'id è relativo a campo, non alla partita
        this.settings = settings;
        this._history = [];
        this._battleFieldSides = new Array(new BattleFieldSide(firstPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()), new BattleFieldSide(secondPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()));
    }
    Match.prototype.executeAction = function (action) {
        if (!action)
            throw new Error("invalid match action!");
        this._history.push(action);
        var targetBattleFieldSide = this._battleFieldSides.filter(function (bfs) { return bfs.playerId != action.playerId; })[0];
        return targetBattleFieldSide.receiveEnemyFire(action.coord);
    };
    Match.prototype.generatePlayerShips = function () {
        var ps = new Array();
        var i = 0;
        var shipId = 1;
        for (i = this.settings.cacciatorpedinieri; i >= 0; i--) {
            ps.push(new Cacciatorpediniere(shipId++));
        }
        for (i = this.settings.corazzate; i >= 0; i--) {
            ps.push(new Corazzata(shipId++));
        }
        for (i = this.settings.portaerei; i >= 0; i--) {
            ps.push(new Portaerei(shipId++));
        }
        for (i = this.settings.sottomarini; i >= 0; i--) {
            ps.push(new Sottomarino(shipId++));
        }
        return ps;
    };
    return Match;
}());
exports.Match = Match;
var MatchAction = /** @class */ (function () {
    function MatchAction(actionCode, playerId, coord) {
        this.actionCode = actionCode;
        this.playerId = playerId;
        this.coord = coord;
    }
    return MatchAction;
}());
exports.MatchAction = MatchAction;
//# sourceMappingURL=game.js.map