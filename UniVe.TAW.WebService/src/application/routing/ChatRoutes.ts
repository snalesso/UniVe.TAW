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
import * as UserToUserChatMessages from '../../domain/models/mongodb/mongoose/UserToUserChatMessages';

import * as DTOs from '../DTOs';
import RoutingParamKeys from './RoutingParamKeys';
import * as moment from 'moment'
import RoutesBase from './RoutesBase';
import * as cors from 'cors';
import * as ChatMessage from '../../domain/models/mongodb/mongoose/ChatMessage';
import ServiceEventKeys from '../services/ServiceEventKeys';

export default class ChatRoutes extends RoutesBase {

    private readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());

        this._router.post(
            '/sendMessage',
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<DTOs.IChatHistoryMessageDto>;

                const currentUserJWTData = (request.user as DTOs.IUserJWTData);
                const currentUserObjectId = new mongoose.Types.ObjectId(currentUserJWTData.Id);
                const incMsg = request.body as DTOs.INewMessage;

                if (!incMsg) {
                    response.status(httpStatusCodes.BAD_REQUEST);
                } else {

                    // let criteria = {
                    //     SenderId: new mongoose.Types.ObjectId(incMsg.SenderId),
                    //     AddresseeId: new mongoose.Types.ObjectId(incMsg.AddresseeId)
                    // } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;

                    User.getModel()
                        .findById(currentUserObjectId)
                        .then(user => {

                            try {

                                if (user) {

                                    let loggedMsg = user.logMessage(new mongoose.Types.ObjectId(incMsg.AddresseeId), incMsg.Text);
                                    if (loggedMsg) {
                                        user.save();

                                        const senderMessageDto = {
                                            IsMine: true,
                                            Text: loggedMsg.Text,
                                            Timestamp: loggedMsg.Timestamp
                                        } as DTOs.IChatHistoryMessageDto;

                                        const addresseeMessageDto = {
                                            IsMine: false,
                                            Text: loggedMsg.Text,
                                            Timestamp: loggedMsg.Timestamp
                                        } as DTOs.IChatHistoryMessageDto;

                                        this._socketIOServer.emit(ServiceEventKeys.chatEventForUser(incMsg.AddresseeId, ServiceEventKeys.YouGotANewMessage), addresseeMessageDto);

                                        responseData = new net.HttpMessage(senderMessageDto);
                                        response
                                            .status(httpStatusCodes.OK)
                                            .json(responseData);
                                    }
                                    else {
                                        response
                                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                                    }
                                }
                                else {
                                    response
                                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        })
                        .catch((error: mongodb.MongoError) => {

                            responseData = new net.HttpMessage(null, error.message);
                            response
                                .status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                        });
                }
            });

        this._router.get(
            '/history/:' + RoutingParamKeys.userId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<ReadonlyArray<DTOs.IChatHistoryMessageDto>>;

                const currentUserJWTData = (request.user as DTOs.IUserJWTData);
                const currentUserObjectId = new mongoose.Types.ObjectId(currentUserJWTData.Id);
                const otherUserHexId = request.params[RoutingParamKeys.userId];
                const otherUserObjectId = new mongoose.Types.ObjectId(otherUserHexId);

                // let currentUserMessagesCriteria = {
                //     SenderId: currentUserObjectId,
                //     AddresseeId: otherUserObjectId
                // } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;
                // let otherUserMessagesCriteria = {
                //     SenderId: otherUserObjectId,
                //     AddresseeId: currentUserObjectId
                // } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;

                // User.getModel()
                //     .findById(currentUserJWTData.Id)
                //     //.populate({ path: "SentMessages", model: ChatMessage.getModel() })
                //     .then(user => {
                //         if (user) {
                //             const messages = user.SentMessages ? user.SentMessages.get(otherUserHexId) : [];
                //             const mDtos: DTOs.IChatHistoryMessageDto[] = [];
                //             for (let m of messages) {
                //                 mDtos.
                //             }
                //             let responseData = new net.HttpMessage(messages);
                //             response
                //                 .status(httpStatusCodes.OK)
                //                 .json(responseData);
                //             // user.logMessage(otherUserObjectId, "3uq9rur9q2or3qur32q");
                //             // user.save();
                //         }
                //     })

                Promise.all(
                    [
                        // UserToUserChatMessages.getModel().findOne(currentUserMessagesCriteria).exec(),
                        // UserToUserChatMessages.getModel().findOne(otherUserMessagesCriteria).exec()
                        User.getModel().findById(currentUserObjectId).exec(),
                        User.getModel().findById(otherUserObjectId).exec()
                    ])
                    .then(users => {
                        const [currentUser, otherUser] = users;

                        let messageDtos = new Array<DTOs.IChatHistoryMessageDto>();
                        if (currentUser.SentMessages) {
                            const cum = currentUser.SentMessages.get(otherUserHexId);
                            if (cum) {
                                for (let m of cum) {
                                    messageDtos.push({
                                        Text: m.Text,
                                        Timestamp: m.Timestamp,
                                        IsMine: true
                                    } as DTOs.IChatHistoryMessageDto)
                                }
                            }
                        }
                        if (otherUser.SentMessages) {
                            const oum = otherUser.SentMessages.get(currentUserJWTData.Id);
                            if (oum) {
                                for (let m of oum) {
                                    messageDtos.push({
                                        Text: m.Text,
                                        Timestamp: m.Timestamp,
                                        IsMine: false
                                    } as DTOs.IChatHistoryMessageDto)
                                }
                            }
                        }

                        // sort by latest first
                        messageDtos = messageDtos.sort((a, b) => {
                            if (a.Timestamp > b.Timestamp)
                                return -1;

                            if (a.Timestamp < b.Timestamp)
                                return 1;

                            return 0;
                        });

                        responseData = new net.HttpMessage(messageDtos);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })

                    // UserToUserChatMessages.getModel()
                    //     .find({ $or: [currentUserMessagesCriteria, otherUserMessagesCriteria] })
                    //     .exec()
                    //     .then(userMessages => {

                    //         let fullChat: DTOs.IChatHistoryMessageDto[] = [];

                    //         for (let u2ucm of userMessages) {
                    //             const isMine = u2ucm.SenderId.equals(currentUserObjectId);
                    //             for (let m of u2ucm.Messages) {
                    //                 fullChat.push({
                    //                     IsMine: isMine,
                    //                     Text: m.Text,
                    //                     Timestamp: m.Timestamp
                    //                 } as DTOs.IChatHistoryMessageDto);
                    //             }
                    //         }

                    //         fullChat = fullChat.sort((a, b) => {
                    //             if (a.Timestamp < b.Timestamp)
                    //                 return -1;

                    //             if (a.Timestamp > b.Timestamp)
                    //                 return 1;

                    //             return 0;
                    //         });

                    //         responseData = new net.HttpMessage(fullChat);
                    //         response
                    //             .status(httpStatusCodes.OK)
                    //             .json(responseData);
                    //     })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                    });
            });
    }
}