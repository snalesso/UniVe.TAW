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
import { IMongooseChatMessage } from '../../domain/models/mongodb/mongoose/ChatMessage';

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

                const incMsg = request.body as DTOs.INewMessage;

                if (!incMsg) {
                    response.status(httpStatusCodes.BAD_REQUEST);
                } else {


                    let criteria = {
                        SenderId: new mongoose.Types.ObjectId(incMsg.SenderId),
                        AddresseeId: new mongoose.Types.ObjectId(incMsg.AddresseeId)
                    } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;

                    UserToUserChatMessages.getModel()
                        .findOne(criteria)
                        .then(userMessages => {
                            const loggedMsg = userMessages.logMessage(incMsg.Text);
                            const loggedMsgDto = {
                                IsMine: true,
                                Text: loggedMsg.Text,
                                Timestamp: loggedMsg.Timestamp
                            } as DTOs.IChatHistoryMessageDto;

                            responseData = new net.HttpMessage(loggedMsgDto);
                            response
                                .status(httpStatusCodes.OK)
                                .json(responseData);
                        })
                        .catch((error: mongodb.MongoError) => {

                            const u2uCMSkel = criteria;
                            UserToUserChatMessages
                                .create(u2uCMSkel)
                                .save()
                                .then(userMessages => {

                                    const loggedMsg = userMessages.logMessage(incMsg.Text);
                                    const loggedMsgDto = {
                                        IsMine: true,
                                        Text: loggedMsg.Text,
                                        Timestamp: loggedMsg.Timestamp
                                    } as DTOs.IChatHistoryMessageDto;

                                    responseData = new net.HttpMessage(loggedMsgDto);
                                    response
                                        .status(httpStatusCodes.OK)
                                        .json(responseData);
                                })
                                .catch((error: mongodb.MongoError) => {

                                    responseData = new net.HttpMessage(null, error.message);
                                    response
                                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                        .json(responseData);
                                });

                        });
                }
            });

        this._router.get(
            '/history/:' + RoutingParamKeys.UserId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<ReadonlyArray<DTOs.IChatHistoryMessageDto>>;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const currentUserObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const otherUserObjectId = request.params[RoutingParamKeys.UserId];

                let currentUserMessagesCriteria = {
                    SenderId: currentUserObjectId,
                    AddresseeId: otherUserObjectId
                } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;
                let otherUserMessagesCriteria = {
                    SenderId: otherUserObjectId,
                    AddresseeId: currentUserObjectId
                } as utils_2_8.Mutable<UserToUserChatMessages.IMongooseUserToUserChatMessages>;

                Promise.all(
                    [
                        UserToUserChatMessages.getModel().findOne(currentUserMessagesCriteria).exec(),
                        UserToUserChatMessages.getModel().findOne(otherUserMessagesCriteria).exec()
                    ])
                    .then(messages => {
                        const [currentUserMessages, otherUserMessages] = messages;


                    })

                UserToUserChatMessages.getModel()
                    .find({ $or: [currentUserMessagesCriteria, otherUserMessagesCriteria] })
                    .exec()
                    .then(userMessages => {

                        let fullChat: DTOs.IChatHistoryMessageDto[] = [];

                        for (let u2ucm of userMessages) {
                            const isMine = u2ucm.SenderId.equals(currentUserObjectId);
                            for (let m of u2ucm.Messages) {
                                fullChat.push({
                                    IsMine: isMine,
                                    Text: m.Text,
                                    Timestamp: m.Timestamp
                                } as DTOs.IChatHistoryMessageDto);
                            }
                        }

                        fullChat = fullChat.sort((a, b) => {
                            if (a.Timestamp < b.Timestamp)
                                return -1;

                            if (a.Timestamp > b.Timestamp)
                                return 1;

                            return 0;
                        });

                        responseData = new net.HttpMessage(fullChat);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                    });
            });
    }
}