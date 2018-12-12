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

export enum Orientation {
    Horizontal,
    Vertical
}

export interface IShipPlacement {
    Type: ShipType;
    Coord: Coord;
    Orientation: Orientation;
}

/** 0 based coord */
export class ShipPlacement implements IShipPlacement {
    constructor(
        public readonly Type: ShipType,
        public readonly Coord: Coord,
        public readonly Orientation: Orientation) {
    }
}

export interface IShipTypeAvailability {
    readonly ShipType: ShipType,
    readonly Count: number
}
export class ShipTypeAvailability /*implements IShipTypeAvailability*/ {
    public constructor(
        public readonly ShipType: ShipType,
        public readonly Count: number) {
        if (this.Count <= 0)
            throw new Error("Cannot place a negative number of ships!");
    }
}

// export enum MatchActionCode {
//     SingleShot = 1,
//     Torpedo,
//     RequestTimeOutStart,
//     RequestTimeOutEnd,
//     Surrend,
// }

export interface IMatchAction {
    //     readonly ActionCode: MatchActionCode;
}

export interface ISingleShotMatchAction extends IMatchAction {
    //readonly ActionCode: MatchActionCode.SingleShot;
    readonly Coord: Coord;
}

// export interface ITorpedoShot extends IMatchAction {
//     readonly ActionCode: MatchActionCode.Torpedo;
//     readonly Orientation: Orientation;
//     readonly StartCoord: Coord;
// }

// export interface IRequestTimeOutStart extends IMatchAction {
//     readonly ActionCode: MatchActionCode.RequestTimeOutStart;
//     readonly DurationSeconds: number;
// }

// export interface IRequestTimeOutEnd extends IMatchAction {
//     readonly ActionCode: MatchActionCode.RequestTimeOutEnd;
// }

// export interface ISurrend extends IMatchAction {
//     readonly ActionCode: MatchActionCode.Surrend;
// }

// export type UMatchAction = ISingleShot | ITorpedoShot | IRequestTimeOutStart | IRequestTimeOutEnd | ISurrend;

// export class MatchAction implements IMatchAction {

//     constructor(
//         public readonly ActionCode: MatchActionCode,
//         public readonly Coord: Coord) {
//     }
// }

export interface IMatchSettings {

    readonly BattleFieldWidth: number;
    readonly BattleFieldHeight: number;
    readonly ShipTypeAvailabilities: ReadonlyArray<IShipTypeAvailability>;
    readonly MinShipsDistance: number;
}

export class MatchSettingsFactory {

    public static readonly BattleFieldMinWidth: number = 10;
    public static readonly BattleFieldMinHeight: number = 10;

    public static readonly BattleFieldMaxWidth: number = 26;
    public static readonly BattleFieldMaxHeight: number = 26;

    public static createDefaultSettings(
        battleFieldWidth: number = MatchSettingsFactory.BattleFieldMinWidth,
        battleFieldHeight: number = MatchSettingsFactory.BattleFieldMinWidth,
        availableShips: ShipTypeAvailability[] = MatchSettingsFactory.getDefaultShipTypeAvailability(),
        minShipsDistance: number = 2) {

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
        } as IMatchSettings;
    }

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
            if (shipPlacement.Orientation == Orientation.Horizontal)
                shipCoords.push(new Coord(shipPlacement.Coord.X + i, shipPlacement.Coord.Y));
            else
                shipCoords.push(new Coord(shipPlacement.Coord.X, shipPlacement.Coord.Y + i));
        }

        return shipCoords;
    }

    public static isValidShipPlacement(
        shipPlacement: ShipPlacement,
        placedShips: ShipPlacement[],
        matchSettings: IMatchSettings): boolean {

        const noTrespassing = shipPlacement.Orientation == Orientation.Horizontal
            ? (shipPlacement.Coord.X + shipPlacement.Type) <= matchSettings.BattleFieldWidth
            : (shipPlacement.Coord.Y + shipPlacement.Type) <= matchSettings.BattleFieldHeight;

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
        matchSettings: IMatchSettings): boolean {
        throw new Error("Not implemented");
    }
}