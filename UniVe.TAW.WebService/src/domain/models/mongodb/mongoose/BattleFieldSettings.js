"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
// TODO: validate min size
var battleFieldSettingsSchema = new mongoose.Schema({
    BattleFieldWidth: {
        required: true,
        type: mongoose.Schema.Types.Number
    },
    BattleFieldHeight: {
        required: true,
        type: mongoose.Schema.Types.Number
    }
}, {
    id: false
});
function getSchema() {
    return battleFieldSettingsSchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=BattleFieldSettings.js.map