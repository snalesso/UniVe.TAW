"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var matchSchema = new mongoose.Schema({
    FirstPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    SecondPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    CreationDateTime: {
        required: true,
        type: mongoose.Schema.Types.Date,
        default: Date.now
    }
});
var matchModel;
function getModel() {
    if (!matchModel) {
        matchModel = mongoose.model('Match', matchSchema);
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