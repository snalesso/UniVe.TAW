import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';

export type IMongooseShipTypeAvailability = game.ShipTypeAvailability & mongoose.Document;

// TODO: ensure cant be NoShip & positive count
const shipTypeAvailabilitySchema = new mongoose.Schema(
    {
        ShipType: {
            required: true,
            type: game.ShipType
        },
        Count: {
            required: true,
            type: mongoose.Schema.Types.Number,
            // validate: {
            //     validator: (value: number) => {
            //         return value >= 0;
            //     },
            //     msg: "Cannot provide a negative quantity of ships"
            // }
        }
    }, {
        id: false
    });

export function getSchema() {
    return shipTypeAvailabilitySchema;
}