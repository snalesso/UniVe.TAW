import { IMatch } from "./Match";

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

// TODO: enrich rules combinations checks
export class MatchSettings {

    public static readonly battleFieldMinWidth: number = 10;
    public static readonly battleFieldMinHeight: number = 10;

    constructor(
        public readonly battleFieldWidth: number = 10,
        public readonly battleFieldHeight: number = 10,

        public readonly cacciatorpedinieri: number = 4,
        public readonly sottomarini: number = 2,
        public readonly corazzate: number = 2,
        public readonly portaerei: number = 1) {

        if (this.battleFieldHeight <= 0
            || this.battleFieldHeight <= 0
            || this.battleFieldWidth < MatchSettings.battleFieldMinWidth
            || this.battleFieldHeight < MatchSettings.battleFieldMinHeight)
            throw new Error("invalid BattleField size");

        let shipQs = new Array(cacciatorpedinieri, sottomarini, corazzate, portaerei);
        if (!shipQs.every((sq) => sq >= 0)
            || shipQs.some((sq) => sq < 0))
            throw new Error("Invalid ships quantities!");
    }
}

export class BattleFieldSide {

    private readonly cells: BattleFieldCell[][];

    constructor(
        public readonly playerId: any,
        public readonly width: number,
        public readonly height: number,
        readonly ships: Ship[]) {

        this.cells = new BattleFieldCell[this.width][this.height];
    }


    public placeShip(ship: Ship, coord: Coord, direction: Direction) {

    }

    public receiveEnemyFire(coord: Coord) {
        if (!this.isValidCoord(coord))
            throw new Error("coord is outside battlefield boundaries");
    }

    // TODO: should check coord != undefined too???
    private isValidCoord(coord: Coord): boolean {
        return coord
            && coord != undefined
            && coord.X >= 0
            && coord.X < this.width
            && coord.Y >= 0
            && coord.Y < this.height;
    }

    private _isLocked: boolean = true;
    public get isLocked(): boolean { return this._isLocked; }
}

export class Match /*implements IMatch*/ {

    private readonly _battleFieldSides: BattleFieldSide[];//{ [playerId: string]: BattleField } = {};
    private readonly _history: MatchAction[] = [];

    constructor(
        public readonly settings: MatchSettings,
        firstPlayerId: any,
        secondPlayerId: any) {
        this._battleFieldSides = new Array(
            new BattleFieldSide(firstPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight),
            new BattleFieldSide(secondPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight));
    }

    public executeAction(action: MatchAction) {
        if (!action) throw new Error("invalid match action!");

        this._history.push(action);

        let targetBattleFieldSide = this._battleFieldSides.filter(bfs => bfs.playerId != action.attackingPlayerId)[0];
        return targetBattleFieldSide.receiveEnemyFire(action.coord);
    }

}

export class MatchAction {
    constructor(
        public readonly attackingPlayerId: any,
        public readonly coord: Coord
    ) {
    }
}