"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Coord = require("./Coord");
var game = require("../../../../infrastructure/game");
var shipPlacementSchema = new mongoose.Schema({
    Type: {
        required: true,
        type: game.ShipType
    },
    Coord: {
        required: true,
        type: Coord.getSchema()
    },
    Orientation: {
        required: true,
        type: game.ShipOrientation
    }
}, {
    id: false
});
function getSchema() {
    return shipPlacementSchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=ShipPlacement.js.map