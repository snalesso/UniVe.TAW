import * as game from './game';

export enum OwnBattleFieldCellStatus {
    Untouched,
    Hit
}

export enum EnemyBattleFieldCellStatus {
    Unknown,
    Water,
    Ship,
    HitShip
}

export interface IOwnBattleFieldCell {
    readonly Coord: game.Coord;
    ShipType: game.ShipType;
    Status: OwnBattleFieldCellStatus; // = OwnBattleFieldCellStatus.Untouched;
}

export interface IEnemyBattleFieldCell {
    readonly Coord: game.Coord;
    Status: EnemyBattleFieldCellStatus;
}

// used to organize ships, generates the readonly battlefield side
export class BattleFieldConfigurator {

    //private readonly _formation: BattleFieldCell;
    private readonly _availableShips: game.ShipTypeAvailability[];
    private readonly _avShips: { [type: number]: number; } = {};

    public constructor(
        public readonly Width: number,
        public readonly Height: number,
        availableShips: game.ShipTypeAvailability[]) {

        if (this.Height <= 0 || this.Width <= 0)
            throw new Error("Invalid battle field size!");
        if (availableShips == null || availableShips.length <= 0)
            throw new Error("Cannot play a match without ships!");

        this._availableShips = availableShips;
        this._availableShips.forEach(sa => this._avShips[sa.ShipType] = sa.Count);
    }

    public canPlaceShipOfType(type: game.ShipType): boolean {
        return (this._avShips[type] > 0);
    }

    public placeShip(type: game.ShipType, coord: game.Coord): void {
        if (this._avShips[type] <= 0)
            throw new Error("There are no ships of type " + type.toString() + " to place!");

        if (coord.X < 0 || coord.X > this.Width || coord.Y < this.Height || coord.Y > this.Height) {
            throw new Error("Coord is outside battle field boundaries!");
        }

        this._avShips[type]--;
    }
}