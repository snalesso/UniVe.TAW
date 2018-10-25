import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './BattleFieldCell';
//import * as BattleFieldSettings from './BattleFieldSettings';
import * as MatchSettings from './MatchSettings';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as utils_2_8 from '../../../../infrastructure/utils-2.8';
import { read } from 'fs';
//import * as game_client from '../../../../infrastructure/game.client';

// TODO: split validators into many single validators each with its own error message

export interface IMongooseEndedMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    readonly BattleFieldCells: ServerSideBattleFieldCell.IMongooseBattleFieldCell[][]
}

const endedMatchPlayerSideSchema = new mongoose.Schema(
    {
        PlayerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Constants.ModelsNames.User,
            required: true
        },
        BattleFieldCells: {
            required: true,
            type: [[ServerSideBattleFieldCell.getSchema()]],
            default: null
        }
    }, {
        id: false
    });

export function getSchema() {
    return endedMatchPlayerSideSchema;
}

// let playerSideModel;
// export function getModel(): mongoose.Model<IMongooseMatchPlayerSide> {
//     if (!playerSideModel) {
//         playerSideModel = mongoose.model(Constants.ModelsNames.MatchPlayerSide, playerSideModel);
//     }
//     return playerSideModel;
// }

// export function create(data: any): IMongooseMatchPlayerSide {
//     let matchModelCtor = getModel();
//     let newMatch = new matchModelCtor(data);

//     return newMatch;
// }