"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var MatchSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Matchname: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    birthDate: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    countryId: {
        type: mongoose.SchemaTypes.Number,
        required: false
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});
function getSchema() { return MatchSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var MatchModel; // This is not exposed outside the model
function getModel() {
    if (!MatchModel) {
        MatchModel = mongoose.model('Match', getSchema());
    }
    return MatchModel;
}
exports.getModel = getModel;
function create(data) {
    var MatchModelCtor = getModel();
    var Match = new MatchModelCtor(data);
    return Match;
}
exports.create = create;
//# sourceMappingURL=Match.js.map