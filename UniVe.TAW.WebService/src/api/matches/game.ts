//import * as Observable from 'rxjs/Observable';

export abstract class Ship {

    public constructor() {
    }

    public abstract readonly size: number;

    public isWrecked(): boolean {
        return false;
    }
}

export enum Direction {
    Up,
    Down,
    Left,
    Right,
}

export class Coord {

    public constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public readonly X: number;
    public readonly Y: number;
}

export declare enum BattleFieldCellStatus {
    Unknown,
    Water,
    Hit
}

export class BattleFieldCell {
    public readonly Status: BattleFieldCellStatus;
}

export class ShipPositionValidator {

}

export class MatchRules {
    public static readonly BattleFieldHeight: number = 10;
    public static readonly BattleFieldWidth: number = 10;
}

export class BattleField {

    public static readonly MinWidth: number = 10;
    public static readonly MinHeight: number = 10; // BattleField.MinWidth;

    public readonly Width: number;
    public readonly Height: number;

    private readonly cells: BattleFieldCell[][];

    constructor(width: number = BattleField.MinWidth, height: number = BattleField.MinHeight) {
        if (width <= 0 || height <= 0
            || width < BattleField.MinWidth || height < BattleField.MinHeight)
            throw new Error("invalid BattleField size");

        this.cells = new BattleFieldCell[this.Width][this.Height];

    }

    public PlaceShip(ship: Ship) {

    }

    public ReceiveEnemyFire(coord: Coord) {
        if (!coord)
            throw new Error("coord cannot be null");
        if (
            coord.X < 0
            || coord.X >= this.Width
            || coord.Y < 0
            || coord.Y >= this.Height)
            throw new Error("coord is outside battlefield boundaries");
    }

    private _isLocked: boolean = true;
    public get isLocked(): boolean { return this._isLocked; }
}