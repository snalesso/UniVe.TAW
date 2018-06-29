"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var crypto = require("crypto");
var enums = require("../../../enums/user");
var userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Username: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    BirthDate: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    Roles: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        default: enums.UserRoles.Player
    },
    CountryId: {
        type: mongoose.SchemaTypes.Number,
        required: false
    },
    Salt: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    Digest: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});
//userSchema.virtual("Matches", { ref: "Match", localField: "_id", foreignField: "FirstPlayerId" });
userSchema.methods.SetPassword = function (pwd) {
    this.Salt = crypto.randomBytes(16).toString('hex');
    var hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    this.Digest = hmac.digest('hex');
};
userSchema.methods.ValidatePassword = function (pwd) {
    var hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.Digest === digest);
};
//export function GetSchema() { return userSchema; }
var userModel;
function GetModel() {
    if (!userModel) {
        userModel = mongoose.model('User', userSchema); //GetSchema());
    }
    return userModel;
}
exports.GetModel = GetModel;
// export function create(data: IUser) : mongoose.Document<IUser> {
function Create(data) {
    var userModelCtor = GetModel();
    var user = new userModelCtor(data);
    return user;
}
exports.Create = Create;
// export function CreateDto(mongoUser: IMongoUser) {
//     return new auth.UserDto(
//         JSON.stringify(mongoUser._id),
//         mongoUser.Username,
//         utils.GetAge(mongoUser.BirthDate),
//         mongoUser.CountryId);
// }
//# sourceMappingURL=User.js.map