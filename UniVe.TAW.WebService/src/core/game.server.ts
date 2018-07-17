import * as game from './game';

export class ServerSideBattleFieldCell {

    public constructor(
        shipType: game.ShipType = game.ShipType.NoShip,
        fireReceivedDateTime: Date = null) {

        this.ShipType = shipType;
        this._fireReceivedDateTime = fireReceivedDateTime;
    }

    public readonly ShipType: game.ShipType;

    public get HasReceivedFire(): boolean {
        return this._fireReceivedDateTime != null;
    }

    private _fireReceivedDateTime: Date;
    public get FireReceivedDateTime(): Date {
        return this._fireReceivedDateTime;
    }

    public receiveFire(): boolean {
        this._fireReceivedDateTime = new Date();

        return this.HasReceivedFire;
    }

    ///////////////////////////////////

    // GET + SET with validation in SET

    // private _hasReceivedFire: boolean;
    // public get HasReceivedFire(): boolean {
    //     return this._hasReceivedFire;
    // }
    // public set HasReceivedFire(value: boolean) {
    //     if (this._hasReceivedFire)
    //         throw new Error("This cell has already been shot to!");
    //     this._hasReceivedFire = true;
    // }
}