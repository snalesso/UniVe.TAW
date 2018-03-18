declare abstract class Ship {
    constructor(size: number);
    readonly Size: number;
    IsWrecked(): boolean;
}
declare enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}
declare class Match {
}
declare class Coord {
    constructor(x: number, y: number);
    readonly X: number;
    readonly Y: number;
}
declare class PlayerSide {
    ReceiveEnemyFire(coord: Coord): void;
}
declare class Fleet {
}
declare abstract class Action {
    abstract Execute: any;
}
