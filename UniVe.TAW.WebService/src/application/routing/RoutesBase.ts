import * as express from 'express';
import * as socketio from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as expressJwt from 'express-jwt';
import * as DTOs from '../../application/DTOs';
import * as User from '../../domain/models/mongodb/mongoose/User';
import { MongoError } from 'mongodb';

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
        req: express.Request,
        payload: DTOs.IUserJWTPayload,
        done: (err: any, revoked: boolean) => any) {

        User.getModel().findById(payload.Id)
            .then((user: User.IMongooseUser) => {
                const error = user.BannedUntil == null ? null : "User banned";
                const isRevoked = user.BannedUntil != null;
                return done(error, isRevoked);
            })
            .catch((error: MongoError) => {
                return done("Couldn't validate token", true);
            });
    }
}