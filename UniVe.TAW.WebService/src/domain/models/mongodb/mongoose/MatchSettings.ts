import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipTypeAvailability from './ShipTypeAvailability';
import * as BattleFieldSettings from './BattleFieldSettings';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';

export type IMongooseMatchSettings = game.MatchSettings & mongoose.Document;

const matchSettingsSchema = new mongoose.Schema(
    {
        BattleFieldSettings: {
            required: true,
            type: BattleFieldSettings.getSchema()
        },
        ShipTypeAvailability: {
            required: true,
            type: ShipTypeAvailability.getSchema()
        },
        MinShipDistance: {
            required: true,
            type: mongoose.Schema.Types.Number
        }
    }, {
        id: false
    });

export function getSchema() {
    return matchSettingsSchema;
}