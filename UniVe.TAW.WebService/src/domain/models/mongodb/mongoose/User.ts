import * as mongoose from 'mongoose';
import * as crypto from 'crypto';

import * as enums from '../../../enums/user';

// TODO: add registration date

export interface IMongooseUser extends /*contracts.IUser,*/ mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    Username: string,
    BirthDate: Date,
    CountryId: enums.Country,
    Roles: enums.UserRoles,
    Salt: string,
    Digest: string,
    setPassword: (pwd: string) => void,
    validatePassword: (pwd: string) => boolean
}

// TODO: consider using 'passport-local-mongoose' (https://github.com/saintedlama/passport-local-mongoose)

const userSchema = new mongoose.Schema({
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

userSchema.methods.setPassword = function (pwd: string): void {
    this.Salt = crypto.randomBytes(16).toString('hex');
    let hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    this.Digest = hmac.digest('hex');
};
userSchema.methods.validatePassword = function (pwd: string): boolean {
    let hmac = crypto.createHmac('sha512', this.Salt);
    hmac.update(pwd);
    let digest = hmac.digest('hex');
    return (this.Digest === digest);
}

//export function GetSchema() { return userSchema; }

let userModel;
export function getModel(): mongoose.Model<IMongooseUser> {
    if (!userModel) {
        userModel = mongoose.model('User', userSchema); //GetSchema());
    }
    return userModel;
}

// export function create(data: IUser) : mongoose.Document<IUser> {
export function create(data: any): IMongooseUser {
    let userModelCtor = getModel();
    let user = new userModelCtor(data);

    return user;
}

// export function CreateDto(mongoUser: IMongoUser) {
//     return new auth.UserDto(
//         JSON.stringify(mongoUser._id),
//         mongoUser.Username,
//         utils.GetAge(mongoUser.BirthDate),
//         mongoUser.CountryId);
// }