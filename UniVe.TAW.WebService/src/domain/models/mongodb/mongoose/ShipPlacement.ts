import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';

import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';

export type IMongooseShipPlacement = game.ShipPlacement & mongoose.Document;

const shipPlacementSchema = new mongoose.Schema(
    {
        Type: {
            required: true,
            type: game.ShipType
        },
        Coord: {
            required: true,
            type: Coord.getSchema()
        },
        Orientation: {
            required: true,
            type: game.ShipOrientation
        }
    }, {
        id: false
    });

export function getSchema() {
    return shipPlacementSchema;
}