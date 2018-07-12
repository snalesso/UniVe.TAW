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

export class MatchSettings {

    public static readonly battleFieldMinWidth: number = 10;
    public static readonly battleFieldMinHeight: number = 10;

    private readonly _availableShips: ShipTypeAvailability[] = [];

    constructor(
        public readonly battleFieldWidth: number = MatchSettings.battleFieldMinWidth,
        public readonly battleFieldHeight: number = MatchSettings.battleFieldMinWidth,
        private readonly availableShips: ShipTypeAvailability[]) {

        if (this.BattleFieldWidth < MatchSettings.battleFieldMinWidth
            || this.BattleFieldHeight < MatchSettings.battleFieldMinHeight)
            throw new Error("invalid BattleField size");

        availableShips.forEach(sa => this._availableShips)
    }

    public readonly BattleFieldWidth: number;
    public readonly BattleFieldHeight: number;
}

// export class ShipBlock {
//     public constructor() {
//     }

//     private _isAlive: boolean = true;
//     public isAlive(): boolean {
//         return this._isAlive;
//     }

//     public receiveHit() {
//         return (this._isAlive = false);
//     }
// }

// export abstract class Ship {

//     public constructor(public readonly id: number) {
//     }

//     public abstract readonly size: number;

//     private _blocks: ShipBlock[] = null;
//     public getBlocks(): ShipBlock[] {

//         if (this._blocks == null) {
//             this._blocks = [];
//             for (let i = 0; i < this.size; i++) {
//                 this._blocks.push(new ShipBlock());
//             }
//         }

//         return this._blocks;
//     }
// }

// export class Cacciatorpediniere extends Ship {
//     public readonly size: number = 2;
// }

// export class Sottomarino extends Ship {
//     public readonly size: number = 3;
// }

// export class Corazzata extends Ship {
//     public readonly size: number = 4;
// }

// export class Portaerei extends Ship {
//     public readonly size: number = 5;
// }

// export class BattleFieldCell {

//     public constructor(
//         public status: game_common.BattleFieldCellStatus,
//         public shipBlock?: ShipBlock) {
//     }
// }

// export class ShipPositionValidator {

// }

// // TODO: enrich rules combinations checks


// export class ShipCoordMapping {
//     constructor(public readonly ship: Ship, public readonly coord: game_common.Coord) {
//     }
// }

// // used to organiza ships, generates the readonly battlefield side
// export class BattleFieldPreparator {

// }

// export class BattleFieldSide {

//     private readonly cells: BattleFieldCell[][];
//     private readonly shipsMappings: ShipCoordMapping[];

//     constructor(
//         public readonly playerId: any,
//         public readonly width: number,
//         public readonly height: number,
//         readonly ships: Ship[]) {

//         this.cells = new BattleFieldCell[this.width][this.height];
//         this.shipsMappings = new ShipCoordMapping[this.ships.length];
//     }


//     public placeShip(ship: Ship, coord: game_common.Coord, orientation: game_common.ShipOrientation) {
//         let currentMapping = this.shipsMappings.filter(sm => sm.ship == ship)
//     }

//     public receiveEnemyFire(coord: game_common.Coord) {
//         if (!this.isValidCoord(coord))
//             throw new Error("coord is outside battlefield boundaries");
//     }

//     // TODO: should check coord != undefined too???
//     private isValidCoord(coord: game_common.Coord): boolean {
//         return coord
//             && coord != undefined
//             && coord.X >= 0
//             && coord.X < this.width
//             && coord.Y >= 0
//             && coord.Y < this.height;
//     }

//     private _isLocked: boolean = true;
//     public get isLocked(): boolean { return this._isLocked; }
// }

// export class Match /*implements IMatch*/ {

//     private readonly _battleFieldSides: BattleFieldSide[];//{ [playerId: string]: BattleField } = {};
//     private readonly _history: MatchAction[] = [];

//     constructor(
//         public readonly settings: MatchSettings,
//         firstPlayerId: string,
//         secondPlayerId: string) {

//         // TODO: spostare assegnazioni ID dentro battle field, perchè l'id è relativo a campo, non alla partita
//         this._battleFieldSides = new Array(
//             new BattleFieldSide(firstPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()),
//             new BattleFieldSide(secondPlayerId, this.settings.battleFieldWidth, this.settings.battleFieldHeight, this.generatePlayerShips()));
//     }

//     public executeAction(action: MatchAction) {
//         if (!action) throw new Error("invalid match action!");

//         this._history.push(action);

//         let targetBattleFieldSide = this._battleFieldSides.filter(bfs => bfs.playerId != action.playerId)[0];
//         return targetBattleFieldSide.receiveEnemyFire(action.coord);
//     }

//     private generatePlayerShips() {
//         let ps = new Array<Ship>();
//         let i = 0;
//         let shipId = 1;
//         for (i = this.settings.cacciatorpedinieri; i >= 0; i--) {
//             ps.push(new Cacciatorpediniere(shipId++));
//         }
//         for (i = this.settings.corazzate; i >= 0; i--) {
//             ps.push(new Corazzata(shipId++));
//         }
//         for (i = this.settings.portaerei; i >= 0; i--) {
//             ps.push(new Portaerei(shipId++));
//         }
//         for (i = this.settings.sottomarini; i >= 0; i--) {
//             ps.push(new Sottomarino(shipId++));
//         }

//         return ps;
//     }

// }