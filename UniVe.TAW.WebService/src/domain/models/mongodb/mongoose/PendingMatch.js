"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var pendingMatchSchema = new mongoose.Schema({
    PlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});
var matchModel;
function GetModel() {
    if (!matchModel) {
        matchModel = mongoose.model('Match', pendingMatchSchema);
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
//# sourceMappingURL=PendingMatch.js.map