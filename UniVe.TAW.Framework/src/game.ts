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
        if (x < 0
            || x >= BattleField.Width
            || y < 0
            || y >= BattleField.Height)
            throw new Error("Invalid coords!");

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

export class BattleField {

    // TODO: move to server side
    public static readonly Height: number = 8;
    public static readonly Width: number = 8;

    public ReceiveEnemyFire(coord: Coord) {
        if (!coord)
            throw new Error("coord cannot be null");
    }

    private _isLocked: boolean = true;
    public get isLocked(): boolean { return this._isLocked; }
}

export abstract class Action {
    public abstract Execute
}

export abstract class MatchPhase {

}