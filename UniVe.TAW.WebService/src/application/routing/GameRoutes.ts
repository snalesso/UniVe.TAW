import * as express from 'express';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';

import * as DTOs from '../DTOs';
import RoutesBase from './RoutesBase';
import DataManager from '../DataManager';
import PendingMatchesRoutes from './PendingMatchesRoutes';
import MatchesRoutes from './MatchesRoutes';

export default class GameRoutes extends RoutesBase {

    private readonly _pendingMatchesRoutes: PendingMatchesRoutes;
    private readonly _matchesRoutes: MatchesRoutes;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._router.use("/pendingMatches", (this._pendingMatchesRoutes = new PendingMatchesRoutes(this._socketIOServer)).Router);

        this._router.use("/matches", (this._matchesRoutes = new MatchesRoutes(this._socketIOServer)).Router);

        this._router.get(
            "/playables",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IPlayablesDto> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                DataManager.GetPlayables(userObjectId)
                    .then(playables => {

                        responseData = new net.HttpMessage(playables);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                        console.log(error);
                    });
            }
        );
    }
}