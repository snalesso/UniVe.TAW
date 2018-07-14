export class Coord {

    public constructor(
        public readonly X: number,
        public readonly Y: number) { }
}

export declare enum ShipType {
    NoShip = 0,
    Cacciatorpediniere = 2,
    Sottomarino = 3,
    Corazzata = 4,
    Portaerei = 5
}

export enum ShipOrientation {
    Horizontal,
    Vertical
}

export class ShipPlacement {
    constructor(
        public readonly Type: ShipType,
        public readonly Coord: Coord,
        public readonly Orientation: ShipOrientation) {
    }
}

export class ShipTypeAvailability {
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

export class BattleFieldSettings {

    public static readonly BattleFieldMinWidth: number = 10;
    public static readonly BattleFieldMinHeight: number = 10;

    constructor(
        battleFieldWidth: number = BattleFieldSettings.BattleFieldMinWidth,
        battleFieldHeight: number = BattleFieldSettings.BattleFieldMinWidth, ) {

        if (battleFieldWidth < BattleFieldSettings.BattleFieldMinWidth
            || battleFieldHeight < BattleFieldSettings.BattleFieldMinHeight)
            throw new Error("Invalid BattleField size");

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
        minShipDistance: number = 1) {

        if (battleFieldSettings == null)
            throw new Error("Battle field settings must be specified");

        this.BattleFieldSettings = battleFieldSettings;
        this.AvailableShips = availableShips;
        this.MinShipsDistance = minShipDistance;
    }

    public readonly BattleFieldSettings: BattleFieldSettings;
    public readonly AvailableShips: ReadonlyArray<ShipTypeAvailability>;
    public readonly MinShipsDistance: number;

    public static getDefaultShipTypeAvailability(): ShipTypeAvailability[] {
        return [
            new ShipTypeAvailability(ShipType.Cacciatorpediniere, 4),
            new ShipTypeAvailability(ShipType.Sottomarino, 2),
            new ShipTypeAvailability(ShipType.Corazzata, 2),
            new ShipTypeAvailability(ShipType.Portaerei, 1)
        ];
    }
}