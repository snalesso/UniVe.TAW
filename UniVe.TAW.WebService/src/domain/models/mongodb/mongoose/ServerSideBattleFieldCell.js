"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var game = require("../../../../infrastructure/game");
var serverSideBattleFieldCellSchema = new mongoose.Schema({
    ShipType: {
        required: true,
        type: game.ShipType
    },
    FireReceivedDateTime: {
        required: true,
        type: mongoose.Schema.Types.Date
    }
}, {
    id: false
});
function getSchema() {
    return serverSideBattleFieldCellSchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=ServerSideBattleFieldCell.js.map