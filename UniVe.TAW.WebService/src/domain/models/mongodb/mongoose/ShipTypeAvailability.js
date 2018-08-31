"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var game = require("../../../../infrastructure/game");
// TODO: ensure cant be NoShip & positive count
var shipTypeAvailabilitySchema = new mongoose.Schema({
    ShipType: {
        required: true,
        type: game.ShipType
    },
    Count: {
        required: true,
        type: mongoose.Schema.Types.Number,
    }
}, {
    id: false
});
function getSchema() {
    return shipTypeAvailabilitySchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=ShipTypeAvailability.js.map