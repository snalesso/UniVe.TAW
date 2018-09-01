"use strict";
// export interface ICoord {
//     readonly X: number;
//     readonly Y: number;
// }
Object.defineProperty(exports, "__esModule", { value: true });
var Coord /*implements ICoord*/ = /** @class */ (function () {
    function Coord(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    return Coord;
}());
exports.Coord = Coord;
var ShipType;
(function (ShipType) {
    ShipType[ShipType["NoShip"] = 0] = "NoShip";
    ShipType[ShipType["Destroyer"] = 2] = "Destroyer";
    ShipType[ShipType["Submarine"] = 3] = "Submarine";
    ShipType[ShipType["Battleship"] = 4] = "Battleship";
    ShipType[ShipType["Carrier"] = 5] = "Carrier"; // Portaerei
})(ShipType = exports.ShipType || (exports.ShipType = {}));
var ShipOrientation;
(function (ShipOrientation) {
    ShipOrientation[ShipOrientation["Horizontal"] = 0] = "Horizontal";
    ShipOrientation[ShipOrientation["Vertical"] = 1] = "Vertical";
})(ShipOrientation = exports.ShipOrientation || (exports.ShipOrientation = {}));
/** 0 based coord */
var ShipPlacement = /** @class */ (function () {
    function ShipPlacement(Type, Coord, Orientation) {
        this.Type = Type;
        this.Coord = Coord;
        this.Orientation = Orientation;
    }
    return ShipPlacement;
}());
exports.ShipPlacement = ShipPlacement;
var ShipTypeAvailability /*implements IShipTypeAvailability*/ = /** @class */ (function () {
    function ShipTypeAvailability(ShipType, Count) {
        this.ShipType = ShipType;
        this.Count = Count;
        if (this.Count <= 0)
            throw new Error("Cannot place a negative number of ships!");
    }
    return ShipTypeAvailability;
}());
exports.ShipTypeAvailability = ShipTypeAvailability;
var MatchActionCode;
(function (MatchActionCode) {
    MatchActionCode[MatchActionCode["Attack"] = 0] = "Attack";
    MatchActionCode[MatchActionCode["Surrend"] = 1] = "Surrend";
    MatchActionCode[MatchActionCode["RequestTimeOut"] = 2] = "RequestTimeOut";
})(MatchActionCode = exports.MatchActionCode || (exports.MatchActionCode = {}));
var MatchAction = /** @class */ (function () {
    function MatchAction(ActionCode, Coord) {
        this.ActionCode = ActionCode;
        this.Coord = Coord;
    }
    return MatchAction;
}());
exports.MatchAction = MatchAction;
var MatchSettingsFactory = /** @class */ (function () {
    function MatchSettingsFactory() {
    }
    MatchSettingsFactory.createDefaultSettings = function (battleFieldWidth, battleFieldHeight, availableShips, minShipsDistance) {
        if (battleFieldWidth === void 0) { battleFieldWidth = MatchSettingsFactory.BattleFieldMinWidth; }
        if (battleFieldHeight === void 0) { battleFieldHeight = MatchSettingsFactory.BattleFieldMinWidth; }
        if (availableShips === void 0) { availableShips = MatchSettingsFactory.getDefaultShipTypeAvailability(); }
        if (minShipsDistance === void 0) { minShipsDistance = 2; }
        if (battleFieldWidth < MatchSettingsFactory.BattleFieldMinWidth
            || battleFieldHeight < MatchSettingsFactory.BattleFieldMinHeight
            || battleFieldHeight > MatchSettingsFactory.BattleFieldMaxHeight
            || battleFieldWidth > MatchSettingsFactory.BattleFieldMaxWidth)
            throw new Error("Invalid battlefield size");
        return {
            BattleFieldHeight: battleFieldHeight,
            BattleFieldWidth: battleFieldWidth,
            ShipTypeAvailabilities: availableShips,
            MinShipsDistance: minShipsDistance
        };
    };
    MatchSettingsFactory.getDefaultShipTypeAvailability = function () {
        return [
            new ShipTypeAvailability(ShipType.Destroyer, 4),
            new ShipTypeAvailability(ShipType.Submarine, 2),
            new ShipTypeAvailability(ShipType.Battleship, 2),
            new ShipTypeAvailability(ShipType.Carrier, 1)
        ];
    };
    MatchSettingsFactory.BattleFieldMinWidth = 10;
    MatchSettingsFactory.BattleFieldMinHeight = 10;
    MatchSettingsFactory.BattleFieldMaxWidth = 26;
    MatchSettingsFactory.BattleFieldMaxHeight = 26;
    return MatchSettingsFactory;
}());
exports.MatchSettingsFactory = MatchSettingsFactory;
var FleetValidator = /** @class */ (function () {
    function FleetValidator() {
    }
    FleetValidator.getCoordsDistance = function (coord1, coord2) {
        return new Coord(Math.abs(coord1.X - coord2.X), Math.abs(coord1.Y - coord2.Y));
    };
    FleetValidator.getShipPlacementCoords = function (shipPlacement) {
        var shipCoords = [];
        for (var i = 0; i < shipPlacement.Type; i++) {
            if (shipPlacement.Orientation == ShipOrientation.Horizontal)
                shipCoords.push(new Coord(shipPlacement.Coord.X + i, shipPlacement.Coord.Y));
            else
                shipCoords.push(new Coord(shipPlacement.Coord.X, shipPlacement.Coord.Y + i));
        }
        return shipCoords;
    };
    FleetValidator.isValidShipPlacement = function (shipPlacement, placedShips, matchSettings) {
        var _this = this;
        var noTrespassing = shipPlacement.Orientation == ShipOrientation.Horizontal
            ? (shipPlacement.Coord.X + shipPlacement.Type) <= matchSettings.BattleFieldWidth
            : (shipPlacement.Coord.Y + shipPlacement.Type) <= matchSettings.BattleFieldHeight;
        if (!noTrespassing)
            return false;
        var newShipPlacementCoords = this.getShipPlacementCoords(shipPlacement);
        var occupiedCoords = [].concat.apply([], placedShips.map(function (sp) { return _this.getShipPlacementCoords(sp); })); // flattens matrix to array
        var noCollisions = newShipPlacementCoords.every(function (coord) {
            return occupiedCoords.every(function (oc) {
                var dist = _this.getCoordsDistance(coord, oc);
                return dist.X >= matchSettings.MinShipsDistance || dist.Y >= matchSettings.MinShipsDistance;
            });
        });
        return noCollisions;
    };
    FleetValidator.isValidFleetConfig = function (fleetConfig, matchSettings) {
        throw new Error("Not implemented");
    };
    return FleetValidator;
}());
exports.FleetValidator = FleetValidator;
//# sourceMappingURL=game.js.map