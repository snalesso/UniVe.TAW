import * as game from './game';

export interface IBattleFieldCell {

    readonly ShipType: game.ShipType;
    FireReceivedDateTime: Date;
    //receiveFire(): void;
}