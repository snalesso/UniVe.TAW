import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as MatchPlayerSide from './MatchPlayerSide';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './BattleFieldCell';
import * as User from './User';
//import * as BattleFieldSettings from './BattleFieldSettings';
import * as MatchSettings from './MatchSettings';
import * as Coord from './Coord';

import * as game from '../../../../infrastructure/game';
//import * as game_client from '../../../../infrastructure/game.client';
//import * as chat from '../../../../infrastructure/chat';

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
    areBothConfigured: () => boolean,
    configFleet: (playerId: mongoose.Types.ObjectId, shipPlacements: ShipPlacement.IMongooseShipPlacement[]) => boolean,
    /** returns true if a ship was hit, false if water, exception if it was already hit */
    fire: (firingPlayerId: mongoose.Types.ObjectId, targetCoord: game.Coord) => boolean,
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
matchSchema.methods.areBothConfigured = function (
    this: IMongooseMatch): boolean {

    return this.FirstPlayerSide.isConfigured(this.Settings) && this.SecondPlayerSide.isConfigured(this.Settings);
};
matchSchema.methods.getOwnerMatchPlayerSide = function (
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    let playersSide: MatchPlayerSide.IMongooseMatchPlayerSide = null;

    if (this.FirstPlayerSide.PlayerId instanceof mongoose.Types.ObjectId) {
        if (this.FirstPlayerSide.PlayerId.equals(playerId))
            playersSide = this.FirstPlayerSide;
    }
    else if (this.FirstPlayerSide.PlayerId != null) {
        const user = this.FirstPlayerSide.PlayerId as any as User.IMongooseUser;
        if (user._id.equals(playerId))
            playersSide = this.FirstPlayerSide;
    }
    if (!playersSide) {
        if (this.SecondPlayerSide.PlayerId instanceof mongoose.Types.ObjectId) {
            if (this.SecondPlayerSide.PlayerId.equals(playerId))
                playersSide = this.SecondPlayerSide;
        }
        else if (this.SecondPlayerSide.PlayerId != null) {
            const user = this.SecondPlayerSide.PlayerId as any as User.IMongooseUser;
            if (user._id.equals(playerId))
                playersSide = this.SecondPlayerSide;
        }
    }

    if (!playersSide)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");

    return playersSide;
};
matchSchema.methods.getEnemyMatchPlayerSide = function (
    this: IMongooseMatch,
    playerId: mongoose.Types.ObjectId): MatchPlayerSide.IMongooseMatchPlayerSide {

    if (playerId == null)
        throw new Error("Invalid playerId");

    let playersSide: MatchPlayerSide.IMongooseMatchPlayerSide = null;

    if (this.FirstPlayerSide.PlayerId instanceof mongoose.Types.ObjectId) {
        if (this.FirstPlayerSide.PlayerId.equals(playerId))
            playersSide = this.SecondPlayerSide;
    }
    else if (this.FirstPlayerSide.PlayerId != null) {
        const user = this.FirstPlayerSide.PlayerId as any as User.IMongooseUser;
        if (user._id.equals(playerId))
            playersSide = this.SecondPlayerSide;
    }
    if (!playersSide) {
        if (this.SecondPlayerSide.PlayerId instanceof mongoose.Types.ObjectId) {
            if (this.SecondPlayerSide.PlayerId.equals(playerId))
                playersSide = this.FirstPlayerSide;
        }
        else if (this.SecondPlayerSide.PlayerId != null) {
            const user = this.SecondPlayerSide.PlayerId as any as User.IMongooseUser;
            if (user._id.equals(playerId))
                playersSide = this.FirstPlayerSide;
        }
    }

    if (!playersSide)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");

    return playersSide;
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

    return wasFleetConfigSuccessful;
};
matchSchema.methods.fire = function (
    this: IMongooseMatch,
    firingPlayerId: mongoose.Types.ObjectId,
    targetCoord: game.Coord): boolean {

    if (!this.InActionPlayerId.equals(firingPlayerId))
        throw new Error("You are not allowed to fire!");

    const targetSide = this.getEnemyMatchPlayerSide(firingPlayerId);
    const didHit = targetSide.receiveFire(targetCoord);

    if (didHit) {
        if (targetSide.areAllShipsHit()) {
            this.EndDateTime = new Date();
        }
    } else {
        this.InActionPlayerId = targetSide.PlayerId;
        //this.markModified("InActionPlayerId");
    }

    return didHit;
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