namespace unive.taw.framework.game {

    export abstract class Ship {

        public constructor(size: number) {
            this.Size = size;
        }

        public readonly Size: number;


        public IsWrecked(): boolean {
            return false;
        }
    }

    export enum Direction {
        Up,
        Down,
        Left,
        Right,
    }

    export class Match {

    }

    export class Coord {

        public constructor(x: number, y: number) {
            this.X = x;
            this.Y = y;
        }

        public readonly X: number;
        public readonly Y: number;
    }

    export class PlayerSide {

        public ReceiveEnemyFire(coord: Coord) {
            if (!coord)
                throw new Error("coord cannot be null");
        }
    }

    export class Fleet {

    }

    export abstract class Action {
        public abstract Execute
    }
}