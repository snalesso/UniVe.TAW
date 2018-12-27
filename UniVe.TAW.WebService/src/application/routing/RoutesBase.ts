import * as express from 'express';
import * as socketio from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as expressJwt from 'express-jwt';

import * as identityDTOs from '../DTOs/identity';
import * as gameDTOs from '../DTOs/game';
import * as chatDTOs from '../DTOs/chat';

import * as User from '../../domain/models/mongodb/mongoose/User';
import { MongoError } from 'mongodb';
import *  as net from '../../infrastructure/net';
import * as httpStatusCodes from 'http-status-codes';

export default abstract class RoutesBase {

    protected readonly _router: express.Router = express.Router();
    protected readonly _socketIOServer: socketio.Server;

    protected readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {
        if (!socketIOServer)
            throw new Error("ArgumentNullException for socketIoServer");

        this._socketIOServer = socketIOServer;

        this._jwtValidator = expressJwt({
            secret: process.env.JWT_KEY,
            isRevoked: this.isTokenRevokedCallback
        });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());
    }

    public get Router() { return this._router; }

    private isTokenRevokedCallback(
        request: express.Request,
        payload: identityDTOs.IUserJWTPayload,
        done: (errorMessage: net.IHttpResponseError, revoked: boolean) => any) {

        User.getModel().findById(payload.Id)
            .then((user: User.IMongooseUser) => {
                const error: net.IHttpResponseError = (!user || user.BannedUntil) ? { Message: "Invalid token", Status: httpStatusCodes.UNAUTHORIZED } : null;
                const isRevoked = !user || !!user.BannedUntil;
                return done(error, isRevoked);
            })
            .catch((error: MongoError) => {
                return done({ Message: "Couldn't validate token", Status: httpStatusCodes.INTERNAL_SERVER_ERROR }, true);
            });
    }
}