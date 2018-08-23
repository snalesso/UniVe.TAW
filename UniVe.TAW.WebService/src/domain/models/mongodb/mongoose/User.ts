import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as Constants from './Constants';

import * as identity from '../../../../infrastructure/identity';

// TODO: trim username spaces

export interface IMongooseUser extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly Username: string,
    readonly RegistrationDate: Date,
    BirthDate: Date,
    CountryId: identity.Country,
    Roles: identity.UserRoles,
    Salt: string, // TODO: make readonly?
    Digest: string, // TODO: make readonly?
    setPassword: (pwd: string) => void,
    validatePassword: (pwd: string) => boolean,
    getAge: () => number
}

// TODO: consider using 'passport-local-mongoose' (https://github.com/saintedlama/passport-local-mongoose)

const userSchema = new mongoose.Schema({
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
userSchema.methods.getAge = function (): number {
    return this.BirthDate != null ? moment().diff(this.BirthDate, "years", false) : -1;
}

//export function GetSchema() { return userSchema; }

let userModel;
export function getModel(): mongoose.Model<IMongooseUser> {
    if (!userModel) {
        userModel = mongoose.model(Constants.ModelsNames.User, userSchema); //GetSchema());
    }
    return userModel;
}

// export function create(data: IUser) : mongoose.Document<IUser> {
export function create(data: any): IMongooseUser {
    let userModelCtor = getModel();
    let user = new userModelCtor(data);

    return user;
}