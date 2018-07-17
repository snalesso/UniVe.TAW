import * as mongoose from 'mongoose';
import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';

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