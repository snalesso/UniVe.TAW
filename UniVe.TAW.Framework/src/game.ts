abstract class Ship {

    public constructor(size: number) {
        this.Size = size;
    }

    public readonly Size: number;


    public IsWrecked(): boolean {
        return false;
    }
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

class Match {

}

class Coord {

    public constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public readonly X: number;
    public readonly Y: number;
}

class PlayerSide {

    public ReceiveEnemyFire(coord: Coord) {
        if (!coord)
            throw new Error("coord cannot be null");
    }
}

class Fleet {

}

abstract class Action {
    public abstract Execute
}