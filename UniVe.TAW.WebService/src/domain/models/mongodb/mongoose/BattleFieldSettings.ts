import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipTypeAvailability from './ShipTypeAvailability';
import * as BattleFieldSettings from './BattleFieldSettings';

import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';

export type IMongooseBattleFieldSettings = game.BattleFieldSettings & mongoose.Document;

// TODO: validate min size
const battleFieldSettingsSchema = new mongoose.Schema(
    {
        BattleFieldWidth: {
            required: true,
            type: mongoose.Schema.Types.Number
        },
        BattleFieldHeight: {
            required: true,
            type: mongoose.Schema.Types.Number
        }
    }, {
        id: false
    });

export function getSchema() {
    return battleFieldSettingsSchema;
}