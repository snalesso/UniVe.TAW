import * as express from 'express';
import * as socketio from 'socket.io';

export default abstract class RoutesBase {

    protected readonly _router: express.Router = express.Router();

    public constructor(socketIoServer: socketio.Server) {
        if (!socketIoServer)
            throw new Error("ArgumentNullException for socketIoServer");

    }

    public get Router() { return this._router; }
}