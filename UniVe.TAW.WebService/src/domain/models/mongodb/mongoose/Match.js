"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Constants = require("./Constants");
var MatchPlayerSide = require("./MatchPlayerSide");
//import * as BattleFieldSettings from './BattleFieldSettings';
var MatchSettings = require("./MatchSettings");
var game = require("../../../../infrastructure/game");
var matchSchema = new mongoose.Schema({
    Settings: {
        type: MatchSettings.getSchema(),
        required: true,
    },
    CreationDateTime: {
        type: mongoose.Schema.Types.Date,
        required: true,
        default: Date.now
    },
    StartDateTime: {
        type: mongoose.Schema.Types.Date,
        required: false,
    },
    EndDateTime: {
        type: mongoose.Schema.Types.Date,
        required: false,
    },
    InActionPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: Constants.ModelsNames.User,
    },
    FirstPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
    },
    SecondPlayerSide: {
        type: MatchPlayerSide.getSchema(),
        required: true,
    },
});
matchSchema.methods.getOwnerMatchPlayerSide = function (playerId) {
    if (playerId == null)
        throw new Error("Invalid playerId");
    var playersSide = (this.FirstPlayerSide.PlayerId == playerId) ? this.FirstPlayerSide : this.SecondPlayerSide;
    if (playersSide.PlayerId != playerId)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return playersSide;
};
matchSchema.methods.getEnemyMatchPlayerSide = function (playerId) {
    if (playerId == null)
        throw new Error("Invalid playerId");
    var enemySide = (this.FirstPlayerSide.PlayerId == playerId) ? this.SecondPlayerSide : this.FirstPlayerSide;
    if (this.SecondPlayerSide.PlayerId != playerId)
        throw new Error("Player " + playerId.toHexString() + " is not playing in this match");
    return enemySide;
};
matchSchema.methods.configFleet = function (playerId, fleetConfig) {
    var sideToConfig = this.getOwnerMatchPlayerSide(playerId);
    // TODO: check settings compliance
    if (fleetConfig == null || fleetConfig.length <= 0 /*|| fleetConfig.every(sp => sp.Coord.X < 0 && sp.Coord.X > this.Settings)*/)
        throw new Error("Fleet config does not comply with match settings!");
    sideToConfig.configFleet(this.Settings, fleetConfig);
    if (this.FirstPlayerSide.FleetConfig != null
        && this.SecondPlayerSide.FleetConfig != null) {
        // TODO: set random starting player, then StartDateTime
        this.StartDateTime = new Date();
    }
};
matchSchema.methods.executeAction = function (playerId, actionCode, coord) {
    // TODO: check the player is in this match
    switch (actionCode) {
        case game.MatchActionCode.Attack:
            var targetSide = this.getEnemyMatchPlayerSide(playerId);
            targetSide.receiveFire(coord);
            break;
        case game.MatchActionCode.RequestTimeOut:
            throw new Error("Not implemented!");
            break;
        case game.MatchActionCode.Surrend:
            throw new Error("Not implemented!");
            break;
        default:
            var errMsg = "Invalid MatchActionCode!";
            console.log(errMsg);
            throw new Error(errMsg);
            break;
    }
};
var matchModel;
function getModel() {
    if (!matchModel) {
        matchModel = mongoose.model(Constants.ModelsNames.Match, matchSchema);
    }
    return matchModel;
}
exports.getModel = getModel;
function create(data) {
    var matchModelCtor = getModel();
    var newMatch = new matchModelCtor(data);
    return newMatch;
}
exports.create = create;
//# sourceMappingURL=Match.js.map