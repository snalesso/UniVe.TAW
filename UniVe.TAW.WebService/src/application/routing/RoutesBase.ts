import * as express from 'express';
import * as socketio from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as expressJwt from 'express-jwt';

export default abstract class RoutesBase {

    protected readonly _router: express.Router = express.Router();
    protected readonly _socketIOServer: socketio.Server;

    protected readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {
        if (!socketIOServer)
            throw new Error("ArgumentNullException for socketIoServer");

        this._socketIOServer = socketIOServer;

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());
    }

    public get Router() { return this._router; }
}