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
function GetModel() {
    if (!matchModel) {
        matchModel = mongoose.model('Match', matchSchema);
    }
    return matchModel;
}
exports.GetModel = GetModel;
function Create(data) {
    var matchModelCtor = GetModel();
    var newMatch = new matchModelCtor(data);
    return newMatch;
}
exports.Create = Create;
//# sourceMappingURL=Match.js.map