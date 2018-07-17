import * as mongoose from 'mongoose';
import * as game from '../../../../core/game';

export type IMongooseCoord = game.Coord & mongoose.Document;

const coordSchema = new mongoose.Schema(
    {
        X: {
            required: true,
            type: mongoose.Schema.Types.Number
        },
        Y: {
            required: true,
            type: mongoose.Schema.Types.Number
        }
    }, {
        id: false
    });

export function getSchema() {
    return coordSchema;
}