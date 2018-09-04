import * as mongoose from 'mongoose';
import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';
import * as Constants from './Constants';

export type IMongooseServerSideBattleFieldCell = game_server.IServerSideBattleFieldCell & mongoose.Document;

const serverSideBattleFieldCellSchema = new mongoose.Schema(
    {
        ShipType: {
            required: true,
            type: game.ShipType
        },
        FireReceivedDateTime: {
            required: false,
            type: mongoose.Schema.Types.Date
        }
    }, {
        id: false
    });
serverSideBattleFieldCellSchema.methods.receiveFire = function (
    this: IMongooseServerSideBattleFieldCell,
    coord: game.Coord): void {

    if (this.FireReceivedDateTime != null)
        throw new Error("This cell has already been shot to!");

    this.FireReceivedDateTime = new Date();
};

export function getSchema() {
    return serverSideBattleFieldCellSchema;
}

let serverSideBattleFieldCellModel;
export function getModel(): mongoose.Model<IMongooseServerSideBattleFieldCell> {
    if (!serverSideBattleFieldCellModel) {
        serverSideBattleFieldCellModel = mongoose.model(Constants.ModelsNames.ServerSideBattleFieldCell, serverSideBattleFieldCellSchema);
    }
    return serverSideBattleFieldCellModel;
}

export function create(data: any): IMongooseServerSideBattleFieldCell {
    let matchModelCtor = getModel();
    let newPendingMatch = new matchModelCtor(data);

    return newPendingMatch;
}