import * as game from './game';

export class ServerSideBattleFieldCell {

    public constructor(
        shipType: game.ShipType = game.ShipType.NoShip,
        isHit: boolean = false) {
        this.ShipType = shipType;
    }

    public readonly ShipType: game.ShipType;

    private _isHit: boolean;
    public isHit(): boolean {
        return this._isHit;
    }

    public receiveFire(): boolean {
        if (this._isHit == true)
            throw new Error("Cannot fire 2 times to the same coord!");

        this._isHit = true;

        return this._isHit;
    }
}