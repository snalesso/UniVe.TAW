// export interface ICoord {
//     readonly X: number;
//     readonly Y: number;
// }

export class Coord /*implements ICoord*/ {

    public constructor(
        public readonly X: number,
        public readonly Y: number) { }
}

export enum ShipType {
    NoShip = 0,
    Destroyer = 2, // Cacciatorpediniere
    Submarine = 3,  // Sottomarino
    Battleship = 4, // Corazzata
    Carrier = 5  // Portaerei
}

export enum ShipOrientation {
    Horizontal,
    Vertical
}

// export interface IShipPlacement {
//     Type: ShipType;
//     Coord: Coord;
//     Orientation: ShipOrientation;
// }

/** 0 based coord */
export class ShipPlacement {
    constructor(
        public readonly Type: ShipType,
        public readonly Coord: Coord,
        public readonly Orientation: ShipOrientation) {
    }
}

// export interface IShipTypeAvailability {
//     readonly ShipType: ShipType,
//     readonly Count: number
// }
export class ShipTypeAvailability /*implements IShipTypeAvailability*/ {
    public constructor(
        public readonly ShipType: ShipType,
        public readonly Count: number) {
        if (this.Count <= 0)
            throw new Error("Cannot place a negative number of ships!");
    }
}

export enum MatchActionCode {
    Attack,
    Surrend,
    RequestTimeOut
}

export class MatchAction {

    constructor(
        public readonly ActionCode: MatchActionCode,
        public readonly Coord: Coord) {
    }
}

// TODO: aggregate with match settings
export class BattleFieldSettings {

    public static readonly BattleFieldMinWidth: number = 10;
    public static readonly BattleFieldMinHeight: number = 10;

    public static readonly BattleFieldMaxWidth: number = 26;
    public static readonly BattleFieldMaxHeight: number = 26;

    constructor(
        battleFieldWidth: number = BattleFieldSettings.BattleFieldMinWidth,
        battleFieldHeight: number = BattleFieldSettings.BattleFieldMinWidth) {

        if (battleFieldWidth < BattleFieldSettings.BattleFieldMinWidth
            || battleFieldHeight < BattleFieldSettings.BattleFieldMinHeight
            || battleFieldHeight > BattleFieldSettings.BattleFieldMaxHeight
            || battleFieldWidth > BattleFieldSettings.BattleFieldMaxWidth)
            throw new Error("Invalid battlefield size");

        this.BattleFieldHeight = battleFieldHeight;
        this.BattleFieldWidth = battleFieldWidth;
    }

    public readonly BattleFieldWidth: number;
    public readonly BattleFieldHeight: number;
}

export class MatchSettings {

    constructor(
        battleFieldSettings: BattleFieldSettings = new BattleFieldSettings(),
        availableShips: ShipTypeAvailability[] = MatchSettings.getDefaultShipTypeAvailability(),
        minShipDistance: number = 2) {

        if (battleFieldSettings == null)
            throw new Error("Invalid battlefield settings");

        this.BattleFieldSettings = battleFieldSettings;
        this.AvailableShips = availableShips;
        this.MinShipsDistance = minShipDistance;
    }

    public readonly BattleFieldSettings: BattleFieldSettings;
    public readonly AvailableShips: ReadonlyArray<ShipTypeAvailability>;
    public readonly MinShipsDistance: number;

    public static getDefaultShipTypeAvailability(): ShipTypeAvailability[] {
        return [
            new ShipTypeAvailability(ShipType.Destroyer, 4),
            new ShipTypeAvailability(ShipType.Submarine, 2),
            new ShipTypeAvailability(ShipType.Battleship, 2),
            new ShipTypeAvailability(ShipType.Carrier, 1)
        ];
    }
}

export class FleetValidator {

    public static getCoordsDistance(coord1: Coord, coord2: Coord): Coord {
        return new Coord(Math.abs(coord1.X - coord2.X), Math.abs(coord1.Y - coord2.Y));
    }

    public static getShipPlacementCoords(shipPlacement: ShipPlacement): Coord[] {
        const shipCoords: Coord[] = [];

        for (let i = 0; i < shipPlacement.Type; i++) {
            if (shipPlacement.Orientation == ShipOrientation.Horizontal)
                shipCoords.push(new Coord(shipPlacement.Coord.X + i, shipPlacement.Coord.Y));
            else
                shipCoords.push(new Coord(shipPlacement.Coord.X, shipPlacement.Coord.Y + i));
        }

        return shipCoords;
    }

    public static isValidShipPlacement(
        shipPlacement: ShipPlacement,
        placedShips: ShipPlacement[],
        matchSettings: MatchSettings): boolean {

        const noTrespassing = shipPlacement.Orientation == ShipOrientation.Horizontal
            ? (shipPlacement.Coord.X + shipPlacement.Type) <= matchSettings.BattleFieldSettings.BattleFieldWidth
            : (shipPlacement.Coord.Y + shipPlacement.Type) <= matchSettings.BattleFieldSettings.BattleFieldHeight;

        if (!noTrespassing)
            return false;

        const newShipPlacementCoords = this.getShipPlacementCoords(shipPlacement);
        const occupiedCoords: Coord[] = [].concat.apply([], placedShips.map(sp => this.getShipPlacementCoords(sp))); // flattens matrix to array
        const noCollisions = newShipPlacementCoords.every(coord =>
            occupiedCoords.every(oc => {
                const dist = this.getCoordsDistance(coord, oc);
                return dist.X >= matchSettings.MinShipsDistance || dist.Y >= matchSettings.MinShipsDistance;
            }));

        return noCollisions;
    }

    public static isValidFleetConfig(
        fleetConfig: ShipPlacement[],
        matchSettings: MatchSettings): boolean {
        throw new Error("Not implemented");
    }
}