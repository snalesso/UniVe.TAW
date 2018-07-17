"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Constants = require("./Constants");
var ShipPlacement = require("./ShipPlacement");
var ServerSideBattleFieldCell = require("./ServerSideBattleFieldCell");
var game = require("../../../../core/game");
var game_server = require("../../../../core/game.server");
var matchPlayerSideSchema = new mongoose.Schema({
    PlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Constants.ModelsNames.User,
        required: true
    },
    FleetConfig: {
        type: [ShipPlacement.getSchema()],
        validate: {
            validator: function validator(value) {
                return this.FleetConfig == null // fleetconfig cannot be changed once set
                    && value != null // fleet config cannot be null
                    && value.length > 0; // fleet config cannot be emprty
            }
        }
    },
    BattleFieldCells: {
        type: [[ServerSideBattleFieldCell.getSchema()]],
        validate: {
            validator: function (value) {
                return this.FleetConfig != null // fleetconfig must have been set
                    && value != null // fleet config cannot be null
                    && value.length > 0; // fleet config cannot be emprty
            }
        }
    }
}, {
    id: false
});
matchPlayerSideSchema.methods.configFleet = function (battleFieldSettings, fleetConfig) {
    // TODO: validate fleet config
    this.FleetConfig = fleetConfig;
    var bfCells = [];
    // create empty field
    for (var x = 0; x < battleFieldSettings.BattleFieldWidth; x++) {
        bfCells[x] = [];
        for (var y = 0; y < battleFieldSettings.BattleFieldHeight; y++) {
            bfCells[x][y] = new game_server.ServerSideBattleFieldCell();
        }
    }
    // place ships
    fleetConfig.forEach(function (sp) {
        for (var i = 0; i < sp.Type; i++) {
            if (sp.Orientation == game.ShipOrientation.Horizontal)
                bfCells[sp.Coord.X + i][sp.Coord.Y] = new game_server.ServerSideBattleFieldCell(sp.Type);
            else
                bfCells[sp.Coord.X][sp.Coord.Y + i] = new game_server.ServerSideBattleFieldCell(sp.Type);
        }
    });
    this.BattleFieldCells = bfCells;
};
matchPlayerSideSchema.methods.receiveFire = function (coord) {
    var cellStatus = this.BattleFieldCells[coord.X][coord.Y];
    // this check is here to allow blinded player to fire twice on the same cell, alternative might be to check if the player is blind before calling cell.receiveFire() to prevent cell from throwing an exception
    if (cellStatus.HasReceivedFire)
        throw new Error("This cell has already been shot to!");
    cellStatus.receiveFire();
    return cellStatus.HasReceivedFire;
};
function getSchema() {
    return matchPlayerSideSchema;
}
exports.getSchema = getSchema;
var playerSideModel;
function getModel() {
    if (!playerSideModel) {
        playerSideModel = mongoose.model(Constants.ModelsNames.Match, playerSideModel);
    }
    return playerSideModel;
}
exports.getModel = getModel;
function create(data) {
    var matchModelCtor = getModel();
    var newMatch = new matchModelCtor(data);
    return newMatch;
}
exports.create = create;
//# sourceMappingURL=MatchPlayerSide.js.map