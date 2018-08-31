"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var ShipTypeAvailability = require("./ShipTypeAvailability");
var matchSettingsSchema = new mongoose.Schema({
    BattleFieldWidth: {
        required: true,
        type: mongoose.Schema.Types.Number
    },
    BattleFieldHeight: {
        required: true,
        type: mongoose.Schema.Types.Number
    },
    AvailableShips: {
        required: true,
        type: [ShipTypeAvailability.getSchema()]
    },
    MinShipsDistance: {
        required: true,
        type: mongoose.Schema.Types.Number
    }
}, {
    id: false
});
function getSchema() {
    return matchSettingsSchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=MatchSettings.js.map