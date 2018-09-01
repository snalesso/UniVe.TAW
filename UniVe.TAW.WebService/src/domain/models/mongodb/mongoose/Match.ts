import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as MatchPlayerSide from './MatchPlayerSide';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './ServerSideBattleFieldCell';
//import * as BattleFieldSettings from './BattleFieldSettings';
import * as MatchSettings from './MatchSettings';
import * as Coord from './Coord';

import * as game from '../../../../infrastructure/game';
import * as chat from '../../../../infrastructure/chat';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly Settings: MatchSettings.IMongooseMatchSettings,
    readonly CreationDateTime: Date,
    StartDateTime: Date,
    EndDateTime: Date,
    InActionPlayerId: mongoose.Types.ObjectId,
    // TODO: find other names instead of First & Second? Red & Blue? Black and White?
    FirstPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    SecondPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide,
    // readonly ActionsHistory: game.MatchAction[], // TODO: might be a dedicated type, with methods for: log/clear/unsend
    // readonly ChatHistory: chat.TimeStampedMessage[], // TODO: might be a dedicated type, with methods for: log/clear/unsend
    configFleet: (playerId: mongoose.Types.ObjectId, shipPlacements: ShipPlacement.IMongooseShipPlacement[]) => boolean,
    executeAction: (playerId: mongoose.Types.ObjectId, actionCode: game.MatchActionCode) => void,
    //logChatMessage: (senderId: mongoose.Types.ObjectId, text: string) => chat.TimeStampedMessage,
    getOwnerMatchPlayerSide: (playerId: mongoose.Types.ObjectId) => MatchPlayerSide.IMongooseMatchPlayerSide,
    getEnemyMatchPlayerSide: (playerId: mongoose.Types.ObjectId) => MatchPlayerSide.IMongooseMatchPlayerSide
    //getSortedChatHistory: () => chat.TimeStampedMessage[]
}

const matchSchema = new mongoose.Schema({
    Settings: {
        type: MatchSettings.getSchema(),
        required: true,
        //default: MatchSettings
    },
    CreationDateTime: {
        type: mongoose.Schema.Types.Date,
        required: true,
        default: Date.now
    },
    StartDateTime: {
        type: mongoose.Schema.Types.Date,
        required: false,
        // validate: {
        //     validator: function (this: IMongooseMatch, value: Date): boolean {
        //         // TODO: check for it to work
        //         return this.CreationDateTime.getTime() == null
        //             && value.getTime() > this.CreationDateTime.getTime();
        //     },
        //     msg: 'Match cannot start before its creation!'
        // }
    },
    EndDateTime: {
        type: mongoose.Schema.Types.Date,
        required: false,
        // validate: {
        //     validator: function (this: IMongooseMatch, value: Date): boolean {
        //         // TODO: check for it to work
        //         return this.StartDateTime.getTime() != null
        //             && this.EndDateTime.getTime() == null
        //             && value.getTime() > this.StartDateTime.getTime();
        //     },
        //     msg: 'Match cannot end before it starts!'
        // }
    },
    InActionPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: Constants.ModelsNames.User,
        // validate: {
        //     validator: function (this: IMongooseMatch, value: mongoose.Types.ObjectId): boolean {
        //         // TODO: check for it to work
        //         return value === this.FirstPlayerSide.PlayerId || value === this.SecondPlayerSide.PlayerId;
        //     },
        //     msg: 'Action must be granted to one the match players'
        // }
    },
    FirstPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
        // validate: {
        //     validator: function (this: IMongooseMatch, value: MatchPlayerSide.IMongooseMatchPlayerSide): boolean {
        //         return this.FirstPlayerSide == null
        //             && value != null;
        //     },
        //     msg: "1st player side not valid" // TODO: add error message (anche sulle altre colonne)
        // }
    },
    SecondPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
        // validate: {
        //     validator: function (this: IMongooseMatch, value: MatchPlayerSide.IMongooseMatchPlayerSide): boolean {
        //         return this.SecondPlayerSide == null
        //             && value != null;
        //     },
        //     msg: "2st player side not valid"
        // }
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
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    const playersSide: MatchPlayerSide.IMongooseMatchPlayerSide = (this.FirstPlayerSide.PlayerId.equals(playerId)) ? this.FirstPlayerSide : this.SecondPlayerSide;
    if (!playersSide.PlayerId.equals(playerId))
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return playersSide;
};
matchSchema.methods.getEnemyMatchPlayerSide = function (
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    const enemySide: MatchPlayerSide.IMongooseMatchPlayerSide = (this.FirstPlayerSide.PlayerId.equals(playerId)) ? this.SecondPlayerSide : this.FirstPlayerSide;
    if (!this.SecondPlayerSide.PlayerId.equals(playerId))
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return enemySide;
};
matchSchema.methods.configFleet = function (
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId,
    shipPlacements: ShipPlacement.IMongooseShipPlacement[]): boolean {

    const sideToConfig = this.getOwnerMatchPlayerSide(playerId);
    // TODO: check settings compliance
    if (shipPlacements == null || shipPlacements.length <= 0 /*|| fleetConfig.every(sp => sp.Coord.X < 0 && sp.Coord.X > this.Settings)*/)
        throw new Error("Fleet config does not comply with match settings!");

    const wasFleetConfigSuccessful = sideToConfig.configFleet(this.Settings as MatchSettings.IMongooseMatchSettings, shipPlacements);
    if (wasFleetConfigSuccessful) {
        // TODO: set random starting player, then StartDateTime
        this.StartDateTime = new Date();
    }

    return wasFleetConfigSuccessful;
};
matchSchema.methods.executeAction = function (
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId,
    actionCode: game.MatchActionCode,
    coord: Coord.IMongooseCoord): void {

    // TODO: check the player is in this match

    switch (actionCode) {
        case game.MatchActionCode.Attack:
            const targetSide = this.getEnemyMatchPlayerSide(playerId);
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