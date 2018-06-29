import * as mongoose from 'mongoose';

export interface IMatchMove {

}

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    FirstPlayerId: mongoose.Schema.Types.ObjectId,
    SecondPlayerId: mongoose.Schema.Types.ObjectId,
    CreationDateTime: Date,
    WinnerId: mongoose.Schema.Types.ObjectId,
    GetHistory: () => IMatchMove[],
    // PlayersPairingMode: challenge/random
}

const matchSchema = new mongoose.Schema({
    FirstPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    SecondPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
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