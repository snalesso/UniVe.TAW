import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as Constants from './Constants';
//import * as chat from '../../../../infrastructure/chat';
import * as MongooseChatMessage from './ChatMessage';

export interface IMongooseUserToUserChatMessages extends mongoose.Document {
    SenderId: mongoose.Types.ObjectId;
    AddresseeId: mongoose.Types.ObjectId;
    Messages: Array<MongooseChatMessage.IMongooseChatMessage>;
    logMessage: (text: string) => MongooseChatMessage.IMongooseChatMessage
}

const userToUserChatMessagesSchema = new mongoose.Schema({
    SenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Constants.ModelsNames.User,
        required: true,
        validate: {
            validator: function (this: IMongooseUserToUserChatMessages, value: mongoose.Types.ObjectId): boolean {
                return value != null && !value.equals(this.AddresseeId);
            },
            msg: "SenderId must be not null and cannot be the same as AddresseeId"
        }
    },
    AddresseeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Constants.ModelsNames.User,
        required: true,
        validate: {
            validator: function (this: IMongooseUserToUserChatMessages, value: mongoose.Types.ObjectId): boolean {
                return value != null && !value.equals(this.SenderId);
            },
            msg: "AddresseeId must be not null and cannot be the same as SenderId"
        }
    },
    Messages: {
        type: [MongooseChatMessage.getSchema()],
        required: true,
        default: []
    }
}, { _id: false });

userToUserChatMessagesSchema.methods.logMessage = function (
    this: IMongooseUserToUserChatMessages,
    text: string): MongooseChatMessage.IMongooseChatMessage {

    try {
        const msg = { Text: text } as MongooseChatMessage.IMongooseChatMessage;
        this.Messages.push(msg);
        this.markModified("Messages");

        return msg;
    }
    catch (ex) {
        return null;
    }
};

let userToUserChatMessagesModel;
export function getModel(): mongoose.Model<IMongooseUserToUserChatMessages> {
    if (!userToUserChatMessagesModel) {
        userToUserChatMessagesModel = mongoose.model(Constants.ModelsNames.UserToUserChatMessages, userToUserChatMessagesSchema);
    }

    return userToUserChatMessagesModel;
}

// export function create(data: IUser) : mongoose.Document<IUser> {
export function create(data: any): IMongooseUserToUserChatMessages {
    let u2uChatMessageCtor = getModel();
    let u2uChatMessage = new u2uChatMessageCtor(data);

    return u2uChatMessage;
}