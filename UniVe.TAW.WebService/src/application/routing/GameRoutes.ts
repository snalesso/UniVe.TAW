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
import * as User from '../../domain/models/mongodb/mongoose/User';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as EndedMatch from '../../domain/models/mongodb/mongoose/EndedMatch';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';

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
            async (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IPlayablesDto> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);

                const playables = {} as DTOs.IPlayablesDto;

                try {
                    const pendingMatch = await DataManager.GetPendingMatch(userObjectId);
                    if (pendingMatch) {
                        playables.PendingMatchId = pendingMatch.id;
                    }
                    try {
                        const playingMatch = await DataManager.GetPlayingMatch(userObjectId);
                        if (playingMatch != null) {
                            playables.PlayingMatchId = playingMatch._id.toHexString();
                        }
                        playables.CanCreateMatch = (playables.PendingMatchId == null && playables.PlayingMatchId == null);
                        // if can't create a match it means can't join, then it's useless to query joinable matches
                        if (!playables.CanCreateMatch) {
                            return response
                                .status(httpStatusCodes.OK)
                                .json(new net.HttpMessage(playables));
                        }
                        try {
                            const joinableMatches = await PendingMatch.getModel()
                                .find({ PlayerId: { $ne: userObjectId } })
                                .populate({ path: "PlayerId", model: User.getModel() })
                                .exec();

                            playables.JoinableMatches = joinableMatches.map(jm => {
                                const creator = (jm.PlayerId as any as User.IMongooseUser);
                                return {
                                    Id: jm._id.toHexString(),
                                    Creator: {
                                        Id: creator._id.toHexString(),
                                        Username: creator.Username,
                                        Age: creator.getAge(),
                                        CountryId: creator.CountryId
                                    }
                                } as DTOs.IJoinableMatchDto;
                            });

                            return response
                                .status(httpStatusCodes.OK)
                                .json(new net.HttpMessage(playables));
                        }
                        catch (error) {
                            const mongoError = error as mongodb.MongoError;
                            console.log(mongoError.message);
                            response.statusMessage = mongoError.message;
                            return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                        }
                    }
                    catch (error_1) {
                        const mongoError = error_1 as mongodb.MongoError;
                        console.log(mongoError.message);
                        response.statusMessage = mongoError.message;
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                    }
                }
                catch (error_2) {
                    const mongoError = error_2 as mongodb.MongoError;
                    console.log(mongoError.message);
                    response.statusMessage = mongoError.message;
                    return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
                }
            }
        );
    }
}