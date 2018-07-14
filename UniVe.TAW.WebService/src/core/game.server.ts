import * as game from './game';

export class ServerSideBattleFieldCell {

    public constructor(
        shipType: game.ShipType = game.ShipType.NoShip,
        hasReceivedFire: boolean = false,
        receiveFireDateTime: Date = null) {

        if ((hasReceivedFire && receiveFireDateTime == null)
            || (!hasReceivedFire && receiveFireDateTime != null))
            throw new Error("Mismatch between having been shot and shooting date!");

        this.ShipType = shipType;
        this._hasReceivedFire = hasReceivedFire;
        this._receiveFireDateTime = receiveFireDateTime;
    }

    public readonly ShipType: game.ShipType;

    private _hasReceivedFire: boolean;
    public get HasReceivedFire(): boolean {
        return this._hasReceivedFire;
    }

    private _receiveFireDateTime: Date;
    public get ReceiveFireDateTime(): Date {
        return this._receiveFireDateTime;
    }

    public receiveFire(): boolean {
        this._receiveFireDateTime = new Date();
        this._hasReceivedFire = true;

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