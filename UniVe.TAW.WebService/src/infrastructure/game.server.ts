import * as game from './game';

export interface IServerSideBattleFieldCell {

    readonly ShipType: game.ShipType;
    FireReceivedDateTime: Date;
    //receiveFire(): void;
}