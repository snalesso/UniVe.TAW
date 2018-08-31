import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipTypeAvailability from './ShipTypeAvailability';
//import * as BattleFieldSettings from './BattleFieldSettings';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';

export interface IMongooseMatchSettings extends mongoose.Document {
    readonly BattleFieldWidth: number;
    readonly BattleFieldHeight: number;
    readonly AvailableShips: ReadonlyArray<ShipTypeAvailability.IMongooseShipTypeAvailability>;
    readonly MinShipsDistance: number;
}

const matchSettingsSchema = new mongoose.Schema(
    {
        BattleFieldWidth: {
            required: true,
            type: mongoose.Schema.Types.Number
        },
        BattleFieldHeight: {
            required: true,
            type: mongoose.Schema.Types.Number
        },
        AvailableShips: {
            required: true,
            type: [ShipTypeAvailability.getSchema()]
        },
        MinShipsDistance: {
            required: true,
            type: mongoose.Schema.Types.Number
        }
    }, {
        id: false
    });

export function getSchema() {
    return matchSettingsSchema;
}