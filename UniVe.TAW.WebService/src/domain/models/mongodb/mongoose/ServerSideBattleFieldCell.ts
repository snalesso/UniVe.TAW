import * as mongoose from 'mongoose';
import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';

export type IMongooseServerSideBattleFieldCell = game_server.ServerSideBattleFieldCell & mongoose.Document;

const serverSideBattleFieldCellSchema = new mongoose.Schema(
    {
        ShipType: {
            required: true,
            type: game.ShipType
        },
        FireReceivedDateTime: {
            required: true,
            type: mongoose.Schema.Types.Date
        }
    }, {
        id: false
    });

export function getSchema() {
    return serverSideBattleFieldCellSchema;
}