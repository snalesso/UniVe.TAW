import * as mongoose from 'mongoose';
import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';
import * as Constants from './Constants';

export type IMongooseBattleFieldCell = game_server.IBattleFieldCell & mongoose.Document;

const battleFieldCellSchema = new mongoose.Schema(
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
battleFieldCellSchema.methods.receiveFire = function (
    this: IMongooseBattleFieldCell,
    coord: game.Coord): void {

    if (this.FireReceivedDateTime != null)
        throw new Error("This cell has already been shot to!");

    this.FireReceivedDateTime = new Date();
};

export function getSchema() {
    return battleFieldCellSchema;
}

let serverSideBattleFieldCellModel;
export function getModel(): mongoose.Model<IMongooseBattleFieldCell> {
    if (!serverSideBattleFieldCellModel) {
        serverSideBattleFieldCellModel = mongoose.model(Constants.ModelsNames.ServerSideBattleFieldCell, battleFieldCellSchema);
    }
    return serverSideBattleFieldCellModel;
}

export function create(data: any): IMongooseBattleFieldCell {
    let matchModelCtor = getModel();
    let newPendingMatch = new matchModelCtor(data);

    return newPendingMatch;
}