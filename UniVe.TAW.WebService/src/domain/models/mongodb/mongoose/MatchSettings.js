"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var ShipTypeAvailability = require("./ShipTypeAvailability");
var BattleFieldSettings = require("./BattleFieldSettings");
var matchSettingsSchema = new mongoose.Schema({
    BattleFieldSettings: {
        required: true,
        type: BattleFieldSettings.getSchema()
    },
    ShipTypeAvailability: {
        required: true,
        type: ShipTypeAvailability.getSchema()
    },
    MinShipDistance: {
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