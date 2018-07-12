import * as mongoose from 'mongoose';
import * as Constants from './Constants';
import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';
import { read } from 'fs';

export interface IMongooseMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    FleetConfig: game.ShipPlacement[],
    readonly BattleFieldCells: game_server.ServerSideBattleFieldCell[][],
    // getOwnerView: () => game_client.ClientSideBattleFieldCell_Owner[][],
    // getEnemyView: () => game_client.ClientSideBattleFieldCell_Enemy[][],
    receiveFire(coords: game.Coord[])
}

const playerSideSchema = new mongoose.Schema(
    {
        PlayerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Constants.ModelsNames.User,
            required: true
        },
        FleetConfig: {
            type: [game.ShipPlacement],
            validate: {
                validator: function (value: game.ShipPlacement[]) {
                    return this.FleetConfig == null && value != null && value.length > 0;
                }
            }
        }
    }, {
        id: false
    });

export function getSchema() {
    return playerSideSchema;
}

let playerSideModel;
export function getModel(): mongoose.Model<IMongooseMatchPlayerSide> {
    if (!playerSideModel) {
        playerSideModel = mongoose.model(Constants.ModelsNames.Match, playerSideModel);
    }
    return playerSideModel;
}

export function create(data: any): IMongooseMatchPlayerSide {
    let matchModelCtor = getModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}