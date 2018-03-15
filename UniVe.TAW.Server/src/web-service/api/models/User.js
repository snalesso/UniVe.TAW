"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
    Id: Number,
    Username: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    BirthDate: Date,
    Country: {
        type: String,
        required: true
    }
});
exports.default = mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map