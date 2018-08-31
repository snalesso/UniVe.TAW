import * as express from 'express';
import * as socketio from 'socket.io';

export default abstract class RoutesBase {

    protected readonly _router: express.Router = express.Router();
    protected readonly _socketIOServer: socketio.Server;

    public constructor(socketIOServer: socketio.Server) {
        if (!socketIOServer)
            throw new Error("ArgumentNullException for socketIoServer");

        this._socketIOServer = socketIOServer;
    }

    public get Router() { return this._router; }
}