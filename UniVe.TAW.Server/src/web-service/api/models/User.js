"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Username: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    BirthDate: {
        type: Date,
        required: false
    },
    Country: {
        type: String,
        required: false
    }
});
exports.default = mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map