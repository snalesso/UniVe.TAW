import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as Constants from './Constants';

import * as identity from '../../../../infrastructure/identity';
import * as ChatMessage from './ChatMessage';

export interface IMongooseUser extends mongoose.Document {
    readonly _id: mongoose.Types.ObjectId,
    readonly Username: string,
    readonly RegistrationDate: Date,
    BirthDate: Date,
    CountryId: identity.Country,
    Roles: identity.UserRoles,
    Salt: string,
    Digest: string,
    SentMessages: Map<String, ChatMessage.IMongooseChatMessage[]>,
    BannedUntil: Date,
    setPassword: (pwd: string) => void,
    validatePassword: (pwd: string) => boolean,
    getAge: () => number,
    logMessage: (addresseeId: mongoose.Types.ObjectId, text: string) => ChatMessage.IMongooseChatMessage
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
    },
    SentMessages: {
        type: Map,
        of: [ChatMessage.getSchema()],
        default: new Map()
    },
    BannedUntil: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
});

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
userSchema.methods.logMessage = function (
    this: IMongooseUser,
    addresseeId: mongoose.Types.ObjectId,
    text: string): ChatMessage.IMongooseChatMessage {

    try {
        if (this.SentMessages == null)
            this.SentMessages = new Map<String, ChatMessage.IMongooseChatMessage[]>();

        const msg = ChatMessage.create({ Text: text } as ChatMessage.IMongooseChatMessage);
        const addresseeHexId = addresseeId.toHexString();

        if (!this.SentMessages.has(addresseeHexId)) {
            this.SentMessages.set(addresseeHexId, [msg]);
        }
        else {
            this.SentMessages.get(addresseeHexId).push(msg);
        }
        this.markModified("SentMessages");

        return msg;
    }
    catch (ex) {
        return null;
    }
};

let userModel;
export function getModel(): mongoose.Model<IMongooseUser> {
    if (!userModel) {
        userModel = mongoose.model(Constants.ModelsNames.User, userSchema);
    }
    return userModel;
}

export function create(data: any): IMongooseUser {
    let userModelCtor = getModel();
    let user = new userModelCtor(data);

    return user;
}