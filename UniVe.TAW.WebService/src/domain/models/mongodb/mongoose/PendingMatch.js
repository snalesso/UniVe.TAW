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
function getModel() {
    if (!matchModel) {
        matchModel = mongoose.model('Match', pendingMatchSchema);
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
//# sourceMappingURL=PendingMatch.js.map