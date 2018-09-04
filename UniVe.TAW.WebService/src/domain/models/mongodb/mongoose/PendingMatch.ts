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
        ref: Constants.ModelsNames.User,
        unique: true
    }
});

let pendingMatchModel;
export function getModel(): mongoose.Model<IMongoosePendingMatch> {
    if (!pendingMatchModel) {
        pendingMatchModel = mongoose.model(Constants.ModelsNames.PendingMatch, pendingMatchSchema);
    }
    return pendingMatchModel;
}

export function create(data: any): IMongoosePendingMatch {
    let matchModelCtor = getModel();
    let newPendingMatch = new matchModelCtor(data);

    return newPendingMatch;
}