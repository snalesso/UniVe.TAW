import * as mongoose from 'mongoose';
import * as Constants from './Constants';
import * as MatchPlayerSide from './MatchPlayerSide';
import * as game from '../../../../core/game';
import * as chat from '../../../../core/chat';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly FirstPlayerId: mongoose.Types.ObjectId,
    readonly SecondPlayerId: mongoose.Types.ObjectId,
    readonly CreationDateTime: Date,
    //readonly Settings: game.MatchSettings,
    readonly StartDateTime: Date,
    readonly EndDateTime: Date,
    InActionPlayerId: mongoose.Types.ObjectId,
    readonly FirstPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    readonly SecondPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    readonly ChatHistory: chat.TimeStampedMessage[],
    configFleet: (playerId: mongoose.Types.ObjectId, fleetConfig: game.ShipPlacement[]) => void,
    executeAction: (playerId: mongoose.Types.ObjectId, actionCode: game.MatchActionCode) => void,
    getSortedChatHistory: () => chat.TimeStampedMessage[]
}

const matchSchema = new mongoose.Schema({
    FirstPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    },
    SecondPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    },
    CreationDateTime: {
        required: true,
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    StartDateTime: {
        required: false,
        type: mongoose.Schema.Types.Date
    },
    EndDateTime: {
        required: false,
        type: mongoose.Schema.Types.Date
    },
    InActionPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    },
    FirstPlayerSide: MatchPlayerSide.getSchema(),
    SecondPlayerSide: MatchPlayerSide.getSchema(),
});
matchSchema.methods.executeAction = function (
    playerId: mongoose.Types.ObjectId,
    actionCode: game.MatchActionCode,
    coord: game.Coord): void {
    if (playerId == null)
        throw new Error("Invalid playerId");

    switch (actionCode) {
        case game.MatchActionCode.Attack:
            (this as IMongooseMatch).FirstPlayerSide.receiveFire([coord])
            break;
        case game.MatchActionCode.RequestTimeOut:
            throw new Error("Not implemented!");
            break;
        case game.MatchActionCode.Surrend:
            throw new Error("Not implemented!");
            break;
        default:
            const errMsg = "Invalid MatchActionCode!";
            console.log(errMsg);
            throw new Error(errMsg);
            break;
    }
}

let matchModel;
export function getModel(): mongoose.Model<IMongooseMatch> {
    if (!matchModel) {
        matchModel = mongoose.model(Constants.ModelsNames.Match, matchSchema);
    }
    return matchModel;
}

export function create(data: any): IMongooseMatch {
    let matchModelCtor = getModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}