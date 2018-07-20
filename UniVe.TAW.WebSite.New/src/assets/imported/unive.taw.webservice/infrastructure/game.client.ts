import * as game from './game';

export enum ClientSideBattleFieldCellStatus_Owner {
    Water,
    Ship,
    Hit
}

export enum ClientSideBattleFieldCellStatus_Enemy {
    Unknown,
    Water,
    Hit
}

export class ClientSideBattleFieldCell_Owner {
    public constructor(
        public readonly ShipType: game.ShipType,
        public readonly Status: ClientSideBattleFieldCellStatus_Owner = ClientSideBattleFieldCellStatus_Owner.Water) {
        if (this.ShipType != game.ShipType.NoShip
            && this.Status == ClientSideBattleFieldCellStatus_Owner.Water)
            throw new Error("A cell with a ship cannot be marked as a miss");

        if (this.ShipType == game.ShipType.NoShip
            && this.Status != ClientSideBattleFieldCellStatus_Owner.Water)
            throw new Error("A cell with no ships cannot be hit");
    }
}

export class ClientSideBattleFieldCell_Enemy {
    public constructor(
        public readonly Status: ClientSideBattleFieldCellStatus_Enemy = ClientSideBattleFieldCellStatus_Enemy.Unknown) {
        //if (this.ShipType != game.ShipType.NoShip)
    }
}

// used to organiza ships, generates the readonly battlefield side
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

    public getFinalBattlefield() {

    }
}