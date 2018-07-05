"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var crypto = require("crypto");
var enums = require("../../../enums/user");
// TODO: consider using 'passport-local-mongoose' (https://github.com/saintedlama/passport-local-mongoose)
var userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Username: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true
    },
    BirthDate: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
    Roles: {
        type: mongoose.Schema.Types.Number,
        required: true,
        default: enums.UserRoles.Player
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
//userSchema.virtual("Matches", { ref: "Match", localField: "_id", foreignField: "FirstPlayerId" });
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
//export function GetSchema() { return userSchema; }
var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', userSchema); //GetSchema());
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
// export function CreateDto(mongoUser: IMongoUser) {
//     return new auth.UserDto(
//         JSON.stringify(mongoUser._id),
//         mongoUser.Username,
//         utils.GetAge(mongoUser.BirthDate),
//         mongoUser.CountryId);
// }
//# sourceMappingURL=User.js.map