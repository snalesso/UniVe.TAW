import * as mongoose from 'mongoose';
import crypto = require('crypto');

export interface Match extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    firstPlayerId: mongoose.Schema.Types.ObjectId,
    secondPlayerId: mongoose.Schema.Types.ObjectId,
    startDateTime: Date,

}

export interface MatchMove extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    firstPlayerId: mongoose.Schema.Types.ObjectId,
    secondPlayerId: mongoose.Schema.Types.ObjectId
}

const MatchSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Matchname: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    birthDate: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    countryId: {
        type: mongoose.SchemaTypes.Number,
        required: false
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});

export function getSchema() { return MatchSchema; }

// Mongoose Model
let MatchModel;  // This is not exposed outside the model
export function getModel(): mongoose.Model<Match> { // Return Model as singleton
    if (!MatchModel) {
        MatchModel = mongoose.model('Match', getSchema())
    }
    return MatchModel;
}

export function create(data): Match {
    var MatchModelCtor = getModel();
    var Match = new MatchModelCtor(data);

    return Match;
}