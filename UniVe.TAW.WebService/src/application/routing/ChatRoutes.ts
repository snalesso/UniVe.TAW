import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import * as expressJwt from 'express-jwt';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as identity from '../../infrastructure/identity';
import * as utils_2_8 from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';

import * as identityDTOs from '../DTOs/identity';
import * as gameDTOs from '../DTOs/game';
import * as chatDTOs from '../DTOs/chat';

import RoutingParamKeys from './RoutingParamKeys';
import * as moment from 'moment'
import RoutesBase from './RoutesBase';
import * as cors from 'cors';
import * as ChatMessage from '../../domain/models/mongodb/mongoose/ChatMessage';
import Events from '../Events';

export default class ChatRoutes extends RoutesBase {

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._router.get(
            '/',
            this._jwtValidator,
            async (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<chatDTOs.IChatDto[]>;

                const currentUserJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const currentUserObjectId = new mongoose.Types.ObjectId(currentUserJWTPayload.Id);

                const users = await User.getModel().find().exec();

                let chatDtos = new Array<chatDTOs.IChatDto>();
                const chatsMap = new Map<string, chatDTOs.IChatDto>();

                for (let user of users) {

                    if (!user._id.equals(currentUserObjectId)) {
                        const msgs = (user.SentMessages != null
                            ? user.SentMessages.get(currentUserJWTPayload.Id)
                            : null);
                        const msgDtos = (msgs != null ? msgs : [])
                            .map(msg => ({
                                IsMine: false,
                                Text: msg.Text,
                                Timestamp: msg.Timestamp
                            } as chatDTOs.IChatMessageDto));

                        if (!chatsMap.has(user._id.toHexString())) {
                            chatsMap.set(
                                user._id.toHexString(),
                                {
                                    Interlocutor: {
                                        Id: user._id.toHexString(),
                                        Username: user.Username
                                    },
                                    Messages: msgDtos
                                } as chatDTOs.IChatDto);
                        }
                        else {
                            chatsMap.get(user._id.toHexString()).Messages.push(...msgDtos);
                        }
                    }
                    else {
                        // logged user
                        user.SentMessages.forEach((messages, interlocutorId) => {

                            const msgDtos = (messages != null
                                ? messages
                                : [])
                                .map(msg => ({
                                    IsMine: true,
                                    Text: msg.Text,
                                    Timestamp: msg.Timestamp
                                } as chatDTOs.IChatMessageDto));

                            if (!chatsMap.has(interlocutorId as string)) {

                                const usUsers = users.filter(u => u._id.toHexString() == interlocutorId);
                                const username = usUsers[0].Username;

                                chatsMap.set(
                                    interlocutorId as string,
                                    {
                                        Interlocutor: {
                                            Id: interlocutorId as string,
                                            Username: username
                                        },
                                        Messages: msgDtos
                                    } as chatDTOs.IChatDto);
                            }
                            else {
                                chatsMap.get(interlocutorId as string).Messages.push(...msgDtos);
                            }
                        });
                    }
                }

                // sort from oldest to newest
                for (let ch of chatsMap.values()) {
                    ch.Messages = ch.Messages.sort((a, b) => {
                        if (a.Timestamp < b.Timestamp)
                            return -1;

                        if (a.Timestamp > b.Timestamp)
                            return 1;

                        return 0;
                    })
                    chatDtos.push(ch);
                }

                // // sort chats from oldest to newest
                // chatDtos = chatDtos.sort((a, b) => {
                //     if (a.Messages[a.Messages.length - 1] < b.Messages[b.Messages.length - 1])
                //         return -1;

                //     if (a.Messages[a.Messages.length - 1] > b.Messages[b.Messages.length - 1])
                //         return 1;

                //     return 0;
                // });

                // sort chats by interlocutor username
                chatDtos = chatDtos.sort((a, b) => a.Interlocutor.Username.localeCompare(b.Interlocutor.Username));

                responseData = new net.HttpMessage(chatDtos);
                response
                    .status(httpStatusCodes.OK)
                    .json(responseData);
            });

        this._router.post(
            '/:' + RoutingParamKeys.userId,
            this._jwtValidator,
            async (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<chatDTOs.IChatMessageDto>;

                const currentUserJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const senderUserObjectId = new mongoose.Types.ObjectId(currentUserJWTPayload.Id);
                const incMsg = request.body as chatDTOs.INewMessage;

                if (!incMsg) {
                    responseData = new net.HttpMessage(null, "Invalid messages format");
                    return response.status(httpStatusCodes.BAD_REQUEST).json(responseData);
                }

                const senderUser = await User.getModel().findById(senderUserObjectId).exec();

                try {

                    if (!senderUser) {
                        responseData = new net.HttpMessage(null, "Sender user not found");
                        return response
                            .status(httpStatusCodes.BAD_REQUEST)
                            .json(responseData);
                    }

                    const loggedMsg = senderUser.logMessage(new mongoose.Types.ObjectId(incMsg.AddresseeId), incMsg.Text);

                    if (!loggedMsg) {
                        responseData = new net.HttpMessage(null, "Message logging failed");
                        return response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    }

                    await senderUser.save();

                    const senderId = senderUser._id.toHexString();

                    const senderMessageDto = {
                        IsMine: true,
                        SenderId: senderId,
                        Text: loggedMsg.Text,
                        Timestamp: loggedMsg.Timestamp
                    } as chatDTOs.IChatMessageDto;

                    const addresseeMessageDto = {
                        IsMine: false,
                        SenderId: senderId,
                        Text: loggedMsg.Text,
                        Timestamp: loggedMsg.Timestamp
                    } as chatDTOs.IChatMessageDto;

                    responseData = new net.HttpMessage(senderMessageDto);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);

                    this._socketIOServer.emit(
                        Events.chatEventForUser(Events.YouGotANewMessage, incMsg.AddresseeId, senderId),
                        addresseeMessageDto);

                    this._socketIOServer.emit(
                        Events.chatEventForUser(Events.YouGotANewMessage, incMsg.AddresseeId),
                        addresseeMessageDto);
                }
                catch (ex) {
                    console.log(ex);

                    responseData = new net.HttpMessage(null, "Exception caught: " + ex);
                    return response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }
            });

        this._router.get(
            '/:' + RoutingParamKeys.userId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<chatDTOs.IChatMessageDto[]>;

                const currentUserJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const currentUserObjectId = new mongoose.Types.ObjectId(currentUserJWTPayload.Id);
                const otherUserHexId = request.params[RoutingParamKeys.userId];
                const otherUserObjectId = new mongoose.Types.ObjectId(otherUserHexId);

                Promise.all(
                    [
                        User.getModel().findById(currentUserObjectId).exec(),
                        User.getModel().findById(otherUserObjectId).exec()
                    ])
                    .then(users => {
                        const [currentUser, otherUser] = users;

                        let messageDtos = new Array<chatDTOs.IChatMessageDto>();
                        if (currentUser.SentMessages) {
                            const cum = currentUser.SentMessages.get(otherUserHexId);
                            if (cum) {
                                for (let m of cum) {
                                    messageDtos.push({
                                        Text: m.Text,
                                        Timestamp: m.Timestamp,
                                        IsMine: true
                                    } as chatDTOs.IChatMessageDto)
                                }
                            }
                        }
                        if (otherUser.SentMessages) {
                            const oum = otherUser.SentMessages.get(currentUserJWTPayload.Id);
                            if (oum) {
                                for (let m of oum) {
                                    messageDtos.push({
                                        Text: m.Text,
                                        Timestamp: m.Timestamp,
                                        IsMine: false
                                    } as chatDTOs.IChatMessageDto)
                                }
                            }
                        }

                        // sort by latest first
                        messageDtos = messageDtos.sort((a, b) => {
                            if (a.Timestamp < b.Timestamp)
                                return -1;

                            if (a.Timestamp > b.Timestamp)
                                return 1;

                            return 0;
                        });

                        responseData = new net.HttpMessage(messageDtos);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                    });
            });
    }
}