"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var coordSchema = new mongoose.Schema({
    X: {
        required: true,
        type: mongoose.Schema.Types.Number
    },
    Y: {
        required: true,
        type: mongoose.Schema.Types.Number
    }
}, {
    id: false
});
function getSchema() {
    return coordSchema;
}
exports.getSchema = getSchema;
//# sourceMappingURL=Coord.js.map