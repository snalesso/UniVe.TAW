import * as mongoose from 'mongoose';
import * as Constants from './Constants';
import * as MatchPlayerSide from './MatchPlayerSide';
import * as game from '../../../../core/game';
import * as chat from '../../../../core/chat';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    // readonly FirstPlayerId: mongoose.Types.ObjectId,
    // readonly SecondPlayerId: mongoose.Types.ObjectId,
    readonly CreationDateTime: Date,
    //readonly Settings: game.MatchSettings,
    StartDateTime: Date,
    EndDateTime: Date,
    InActionPlayerId: mongoose.Types.ObjectId,
    readonly FirstPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    readonly SecondPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    readonly ChatHistory: chat.TimeStampedMessage[], // TODO: might be a dedicated type, with methods for: log/clear/unsend
    configFleet: (playerId: mongoose.Types.ObjectId, fleetConfig: game.ShipPlacement[]) => void,
    executeAction: (playerId: mongoose.Types.ObjectId, actionCode: game.MatchActionCode) => void,
    logChatMessage: (senderId: mongoose.Types.ObjectId, text: string) => chat.TimeStampedMessage
    //getSortedChatHistory: () => chat.TimeStampedMessage[]
}

const matchSchema = new mongoose.Schema({
    // FirstPlayerId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: Constants.ModelsNames.User
    // },
    // SecondPlayerId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: Constants.ModelsNames.User
    // },
    CreationDateTime: {
        required: true,
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    StartDateTime: {
        required: false,
        type: mongoose.Schema.Types.Date,
        validate: {
            validator: function (value: Date): boolean {
                // TODO: check for it to work
                return this.CreationDateTime.getTime() == null
                    && value.getTime() > this.CreationDateTime.getTime();
            },
            message: 'Match cannot start before its creation!'
        }
    },
    EndDateTime: {
        required: false,
        type: mongoose.Schema.Types.Date,
        validate: {
            validator: function (value: Date): boolean {
                // TODO: check for it to work
                return
                this.StartDateTime.getTime() != null
                    && this.EndDateTime.getTime() == null
                    && value.getTime() > this.StartDateTime.getTime();
            },
            message: 'Match cannot end before it starts!'
        }
    },
    InActionPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    },
    FirstPlayerSide: MatchPlayerSide.getSchema(),
    SecondPlayerSide: MatchPlayerSide.getSchema(),
    ChatHistory: {
        type: [{
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Constants.ModelsNames.User,
                required: true
            },
            text: {
                type: mongoose.Schema.Types.String,
                required: true,
                // TODO: add validation: cannot be empty string
            },
            TimeStamp: {
                type: mongoose.Schema.Types.Date,
                required: true
            }
        }],
        default: [],
        required: true
    }
});
matchSchema.methods.executeAction = function (
    playerId: mongoose.Types.ObjectId,
    actionCode: game.MatchActionCode,
    coord: game.Coord): void {
    if (playerId == null)
        throw new Error("Invalid playerId");

    // TODO: check the player is in this match

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
matchSchema.methods.configFleet = function (
    playerId: mongoose.Types.ObjectId,
    fleetConfig: game.ShipPlacement[]): void {
    const _this = (this as IMongooseMatch);
    const sideToConfig: MatchPlayerSide.IMongooseMatchPlayerSide = (_this.FirstPlayerSide.PlayerId == playerId) ? _this.FirstPlayerSide : _this.SecondPlayerSide;
    if (sideToConfig.PlayerId != playerId)
        throw new Error("Cannot config flett for player " + playerId.toHexString() + " since it does not partecipate to this match");
    // TODO: check settings compliance
    if (fleetConfig == null || fleetConfig.length <= 0 /*|| fleetConfig.every(sp => sp.Coord.X < 0 && sp.Coord.X > this.Settings)*/)
        throw new Error("Fleet config does not comply with match settings!");
    sideToConfig.FleetConfig = fleetConfig;
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