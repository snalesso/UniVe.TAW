import * as mongoose from 'mongoose';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    FirstPlayerId: mongoose.Schema.Types.ObjectId,
    SecondPlayerId: mongoose.Schema.Types.ObjectId,
    CreationDateTime: Date
    // PlayersPairingMode: challenge/random
}

const matchSchema = new mongoose.Schema({
    FirstPlayerId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    SecondPlayerId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    CreationDateTime: {
        required: true,
        type: mongoose.SchemaTypes.Date,
        default: Date.now
    }
});

let matchModel;
export function GetModel(): mongoose.Model<IMongooseMatch> {
    if (!matchModel) {
        matchModel = mongoose.model('Match', matchSchema);
    }
    return matchModel;
}

export function Create(data: any): IMongooseMatch {
    let matchModelCtor = GetModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}