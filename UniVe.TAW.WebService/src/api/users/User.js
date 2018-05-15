"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var crypto = require("crypto");
var userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    username: {
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
userSchema.methods.setPassword = function (pwd) {
    _this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest
    //
    // From wikipedia: (https://en.wikipedia.org/wiki/HMAC)
    // In cryptography, an HMAC (sometimes disabbreviated as either keyed-hash message
    // authentication code or hash-based message authentication code) is a specific type
    // of message authentication code (MAC) involving a cryptographic hash function and
    // a secret cryptographic key.
    //
    var hmac = crypto.createHmac('sha512', _this.salt);
    hmac.update(pwd);
    _this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
};
userSchema.methods.validatePassword = function (pwd) {
    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.
    //
    var hmac = crypto.createHmac('sha512', _this.salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (_this.digest === digest);
};
function getSchema() { return userSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var userModel; // This is not exposed outside the model
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function createUser(data) {
    var userModelCtor = getModel();
    var user = new userModelCtor(data);
    return user;
}
exports.createUser = createUser;
//# sourceMappingURL=User.js.map