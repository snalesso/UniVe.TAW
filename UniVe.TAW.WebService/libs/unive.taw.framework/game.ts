export abstract class Ship {

    public constructor(public readonly id: number) {
    }

    public abstract readonly size: number;

    public isWrecked(): boolean {
        return false;
    }
}

export class Cacciatorpediniere extends Ship {
    public readonly size: number = 2;
}

export class Sottomarino extends Ship {
    public readonly size: number = 3;
}

export class Corazzata extends Ship {
    public readonly size: number = 4;
}

export class Portaerei extends Ship {
    public readonly size: number = 5;
}

export enum ShipOrientation {
    Horizontal,
    Vertical
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

export class ShipCoordMapping {
    constructor(public readonly ship: Ship, public readonly coord: Coord) {
    }
}

// used to organiza ships, generates the readonly battlefield side
export class BattleFieldPreparator {

}

export class BattleFieldSide {

    private readonly cells: BattleFieldCell[][];
    private readonly shipsMappings: ShipCoordMapping[];

    constructor(
        public readonly playerId: any,
        public readonly width: number,
        public readonly height: number,
        readonly ships: Ship[]) {

        this.cells = new BattleFieldCell[this.width][this.height];
        this.shipsMappings = new ShipCoordMapping[this.ships.length];
    }


    public placeShip(ship: Ship, coord: Coord, orientation: ShipOrientation) {
        let currentMapping = this.shipsMappings.filter(sm => sm.ship == ship)
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

        // TODO: spostare assegnazioni ID dentro battle field, perchè l'id è relativo a campo, non alla partita

        this._battleFieldSides = new Array(
            new BattleFieldSide(firstPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()),
            new BattleFieldSide(secondPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()));
    }

    public executeAction(action: MatchAction) {
        if (!action) throw new Error("invalid match action!");

        this._history.push(action);

        let targetBattleFieldSide = this._battleFieldSides.filter(bfs => bfs.playerId != action.playerId)[0];
        return targetBattleFieldSide.receiveEnemyFire(action.coord);
    }

    private generatePlayerShips() {
        let ps = new Array<Ship>();
        let i = 0;
        let shipId = 1;
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
    }

}

export declare enum MatchActionCode {
    Attack,
    Surrend,
    RequestTimeOut
}

export class MatchAction {
    constructor(
        public readonly actionCode: MatchActionCode,
        public readonly playerId: any,
        public readonly coord: Coord) {
    }
}