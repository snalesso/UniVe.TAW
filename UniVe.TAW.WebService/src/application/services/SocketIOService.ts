import * as SocketIO from 'socket.io';


export default class SocketIOService {
    private readonly _connectedClients: SocketIO.Socket[] = [];

    public constructor(private readonly _server: SocketIO.Server) {
        if (this._server == null) throw new Error("_server cannot be null");
    }

    public send<T>(userId: string, data: T) {

    }

    public broadcast<T>(data: T) {

    }

}