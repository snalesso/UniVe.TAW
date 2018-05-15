export declare abstract class Ship {
    constructor(size: number);
    readonly Size: number;
    IsWrecked(): boolean;
}
export declare enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}
export declare class Match {
}
export declare class Coord {
    constructor(x: number, y: number);
    readonly X: number;
    readonly Y: number;
}
export declare class PlayerSide {
    ReceiveEnemyFire(coord: Coord): void;
}
export declare class Fleet {
}
export declare abstract class Action {
    abstract Execute: any;
}
