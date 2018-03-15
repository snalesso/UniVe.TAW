declare namespace UniVe.TAW.Framework.Game {
    abstract class Ship {
        constructor(size: number);
        readonly Size: number;
        IsWrecked(): boolean;
    }
    enum Direction {
        Up = 0,
        Down = 1,
        Left = 2,
        Right = 3,
    }
    class Match {
    }
    class Coord {
        constructor(x: number, y: number);
        readonly X: number;
        readonly Y: number;
    }
    class PlayerSide {
        ReceiveEnemyFire(coord: Coord): void;
    }
    class Fleet {
    }
    abstract class Action {
        abstract Execute: any;
    }
}
