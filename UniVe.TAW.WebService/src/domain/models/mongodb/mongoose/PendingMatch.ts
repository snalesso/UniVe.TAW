import * as mongoose from 'mongoose';

export interface IMongoosePendingMatch extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    PlayerId: mongoose.Schema.Types.ObjectId
}

const pendingMatchSchema = new mongoose.Schema({
    PlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});

let matchModel;
export function GetModel(): mongoose.Model<IMongoosePendingMatch> {
    if (!matchModel) {
        matchModel = mongoose.model('Match', pendingMatchSchema);
    }
    return matchModel;
}

export function Create(data: any): IMongoosePendingMatch {
    let matchModelCtor = GetModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}