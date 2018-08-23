"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var crypto = require("crypto");
var moment = require("moment");
var Constants = require("./Constants");
var identity = require("../../../../infrastructure/identity");
// TODO: consider using 'passport-local-mongoose' (https://github.com/saintedlama/passport-local-mongoose)
var userSchema = new mongoose.Schema({
    Username: {
        // TODO: http://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true
    },
    BirthDate: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
    RegistrationDate: {
        type: mongoose.Schema.Types.Date,
        required: true,
        default: Date.now
    },
    Roles: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: identity.UserRoles.Player
    },
    CountryId: {
        type: mongoose.Schema.Types.Number,
        required: false
    },
    Salt: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    Digest: {
        type: mongoose.Schema.Types.String,
        required: true
    }
});
// TODO: userSchema.virtual("Matches", { ref: "Match", localField: "_id", foreignField: "FirstPlayerId" });
userSchema.methods.setPassword = function (pwd) {
    this.Salt = crypto.randomBytes(16).toString('hex');
    var hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    this.Digest = hmac.digest('hex');
};
userSchema.methods.validatePassword = function (pwd) {
    var hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.Digest === digest);
};
userSchema.methods.getAge = function () {
    return this.BirthDate != null ? moment().diff(this.BirthDate, "years", false) : -1;
};
//export function GetSchema() { return userSchema; }
var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model(Constants.ModelsNames.User, userSchema); //GetSchema());
    }
    return userModel;
}
exports.getModel = getModel;
// export function create(data: IUser) : mongoose.Document<IUser> {
function create(data) {
    var userModelCtor = getModel();
    var user = new userModelCtor(data);
    return user;
}
exports.create = create;
//# sourceMappingURL=User.js.map