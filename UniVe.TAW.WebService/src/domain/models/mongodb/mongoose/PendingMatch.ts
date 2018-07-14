import * as mongoose from 'mongoose';
import * as Constants from './Constants';

export interface IMongoosePendingMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly PlayerId: mongoose.Types.ObjectId
}

const pendingMatchSchema = new mongoose.Schema({
    PlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    }
});

let matchModel;
export function getModel(): mongoose.Model<IMongoosePendingMatch> {
    if (!matchModel) {
        matchModel = mongoose.model(Constants.ModelsNames.Match, pendingMatchSchema);
    }
    return matchModel;
}

export function create(data: any): IMongoosePendingMatch {
    let matchModelCtor = getModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}