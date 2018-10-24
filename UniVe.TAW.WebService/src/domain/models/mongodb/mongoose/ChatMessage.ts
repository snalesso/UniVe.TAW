import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as Constants from './Constants';
//import * as chat from '../../../../infrastructure/chat';

export interface IMongooseChatMessage extends mongoose.Document {
    Text: string;
    Timestamp: Date;
}

const chatMessageSchema = new mongoose.Schema({
    Text: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    Timestamp: {
        type: mongoose.Schema.Types.Date,
        required: true,
        default: Date.now
    }
}, { _id: false });

export function getSchema() {
    return chatMessageSchema;
}

let chatMessageModel;
export function getModel(): mongoose.Model<IMongooseChatMessage> {
    if (!chatMessageModel) {
        chatMessageModel = mongoose.model(Constants.ModelsNames.ChatMessage, chatMessageSchema);
    }
    return chatMessageModel;
}

// export function create(data: IUser) : mongoose.Document<IUser> {
export function create(data: any): IMongooseChatMessage {
    let chatMessageCtor = getModel();
    let chatMessage = new chatMessageCtor(data);

    return chatMessage;
}