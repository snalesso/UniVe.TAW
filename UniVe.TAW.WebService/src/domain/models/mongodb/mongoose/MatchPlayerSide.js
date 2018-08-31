"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Constants = require("./Constants");
var ShipPlacement = require("./ShipPlacement");
var ServerSideBattleFieldCell = require("./ServerSideBattleFieldCell");
var game = require("../../../../infrastructure/game");
var game_server = require("../../../../infrastructure/game.server");
var matchPlayerSideSchema = new mongoose.Schema({
    PlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Constants.ModelsNames.User,
        required: true
    },
    FleetConfig: {
        type: [ShipPlacement.getSchema()],
    },
    BattleFieldCells: {
        type: [[ServerSideBattleFieldCell.getSchema()]],
    }
}, {
    id: false
});
matchPlayerSideSchema.methods.configFleet = function (matchSettings, fleetConfig) {
    // TODO: validate fleet config
    this.FleetConfig = fleetConfig;
    var bfCells = [];
    // create empty field
    for (var x = 0; x < matchSettings.BattleFieldWidth; x++) {
        bfCells[x] = [];
        for (var y = 0; y < matchSettings.BattleFieldHeight; y++) {
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
// let playerSideModel;
// export function getModel(): mongoose.Model<IMongooseMatchPlayerSide> {
//     if (!playerSideModel) {
//         playerSideModel = mongoose.model(Constants.ModelsNames.MatchPlayerSide, playerSideModel);
//     }
//     return playerSideModel;
// }
// export function create(data: any): IMongooseMatchPlayerSide {
//     let matchModelCtor = getModel();
//     let newMatch = new matchModelCtor(data);
//     return newMatch;
// }
//# sourceMappingURL=MatchPlayerSide.js.map