import * as mongoose from 'mongoose';
import * as Constants from './Constants';
import * as MatchPlayerSide from './Match.MatchPlayerSide';
import * as game from '../../../../core/game';
import * as chat from '../../../../core/chat';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly Settings: game.MatchSettings,
    readonly CreationDateTime: Date,
    StartDateTime: Date,
    EndDateTime: Date,
    InActionPlayerId: mongoose.Types.ObjectId,
    FirstPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    SecondPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    // readonly ActionsHistory: game.MatchAction[], // TODO: might be a dedicated type, with methods for: log/clear/unsend
    // readonly ChatHistory: chat.TimeStampedMessage[], // TODO: might be a dedicated type, with methods for: log/clear/unsend
    configFleet: (playerId: mongoose.Types.ObjectId, fleetConfig: game.ShipPlacement[]) => void,
    executeAction: (playerId: mongoose.Types.ObjectId, actionCode: game.MatchActionCode) => void,
    //logChatMessage: (senderId: mongoose.Types.ObjectId, text: string) => chat.TimeStampedMessage,
    getOwnerMatchPlayerSide: (playerId: mongoose.Types.ObjectId) => MatchPlayerSide.IMongooseMatchPlayerSide,
    getEnemyMatchPlayerSide: (playerId: mongoose.Types.ObjectId) => MatchPlayerSide.IMongooseMatchPlayerSide
    //getSortedChatHistory: () => chat.TimeStampedMessage[]
}

const matchSchema = new mongoose.Schema({
    Settings: {
        required: true,
        type: game.MatchSettings
    },
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
            msg: 'Match cannot start before its creation!'
        }
    },
    EndDateTime: {
        required: false,
        type: mongoose.Schema.Types.Date,
        validate: {
            validator: function (value: Date): boolean {
                const _this = (this as IMongooseMatch);
                // TODO: check for it to work
                return _this.StartDateTime.getTime() != null
                    && _this.EndDateTime.getTime() == null
                    && value.getTime() > _this.StartDateTime.getTime();
            },
            msg: 'Match cannot end before it starts!'
        }
    },
    InActionPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Constants.ModelsNames.User
    },
    FirstPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
        validate: {
            validator: function (value: MatchPlayerSide.IMongooseMatchPlayerSide): boolean {
                const _this = (this as IMongooseMatch);
                return _this.FirstPlayerSide == null
                    && value != null;
            },
            msg: ""
        }
    },
    SecondPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
        validate: {
            validator: function (value: MatchPlayerSide.IMongooseMatchPlayerSide): boolean {
                const _this = (this as IMongooseMatch);
                return _this.SecondPlayerSide == null
                    && value != null;
            }
        }
    },
    // ActionsHistory: {
    //     type: [game.MatchAction],
    //     required: true,
    // },
    // ChatHistory: {
    //     type: [{
    //         senderId: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: Constants.ModelsNames.User,
    //             required: true
    //         },
    //         text: {
    //             type: mongoose.Schema.Types.String,
    //             required: true,
    //             // TODO: add validation: cannot be empty string
    //         },
    //         TimeStamp: {
    //             type: mongoose.Schema.Types.Date,
    //             required: true
    //         }
    //     }],
    //     default: [],
    //     required: true
    // }
});
matchSchema.methods.getOwnerMatchPlayerSide = function (
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    const _this = (this as IMongooseMatch);
    const playersSide: MatchPlayerSide.IMongooseMatchPlayerSide = (_this.FirstPlayerSide.PlayerId == playerId) ? _this.FirstPlayerSide : _this.SecondPlayerSide;
    if (playersSide.PlayerId != playerId)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return playersSide;
};
matchSchema.methods.getEnemyMatchPlayerSide = function (
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    const _this = (this as IMongooseMatch);
    const enemySide: MatchPlayerSide.IMongooseMatchPlayerSide = (_this.FirstPlayerSide.PlayerId == playerId) ? _this.SecondPlayerSide : _this.FirstPlayerSide;
    if (_this.SecondPlayerSide.PlayerId != playerId)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return enemySide;
};
matchSchema.methods.configFleet = function (
    playerId: mongoose.Types.ObjectId,
    fleetConfig: game.ShipPlacement[]): void {

    const _this = (this as IMongooseMatch);
    const sideToConfig = _this.getOwnerMatchPlayerSide(playerId);
    // TODO: check settings compliance
    if (fleetConfig == null || fleetConfig.length <= 0 /*|| fleetConfig.every(sp => sp.Coord.X < 0 && sp.Coord.X > this.Settings)*/)
        throw new Error("Fleet config does not comply with match settings!");
    sideToConfig.configFleet(_this.Settings.BattleFieldSettings, fleetConfig);

    if (_this.FirstPlayerSide.FleetConfig != null
        && _this.SecondPlayerSide.FleetConfig != null) {
        // TODO: set random starting player, then StartDateTime
        _this.StartDateTime = new Date();
    }
};
matchSchema.methods.executeAction = function (
    playerId: mongoose.Types.ObjectId,
    actionCode: game.MatchActionCode,
    coord: game.Coord): void {

    // TODO: check the player is in this match
    const _this = (this as IMongooseMatch);

    switch (actionCode) {
        case game.MatchActionCode.Attack:
            const targetSide = _this.getEnemyMatchPlayerSide(playerId);
            targetSide.receiveFire(coord);
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
};

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