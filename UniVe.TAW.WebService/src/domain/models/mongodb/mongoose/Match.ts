import * as mongoose from 'mongoose';

export interface IMatchMove {

}

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    FirstPlayerId: mongoose.Types.ObjectId,
    SecondPlayerId: mongoose.Types.ObjectId,
    CreationDateTime: Date,
    WinnerId: mongoose.Types.ObjectId,
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
        type: mongoose.Schema.Types.Date,
        default: Date.now
    }
});

let matchModel;
export function getModel(): mongoose.Model<IMongooseMatch> {
    if (!matchModel) {
        matchModel = mongoose.model('Match', matchSchema);
    }
    return matchModel;
}

export function create(data: any): IMongooseMatch {
    let matchModelCtor = getModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}