import * as express from 'express';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as game from '../../infrastructure/game';
import * as game_client from '../../infrastructure/game.client';
import * as utils from '../../infrastructure/utils';
import * as utilsV2_8 from '../../infrastructure/utils-2.8';

import RoutingParamKeys from './RoutingParamKeys';
import ServiceEventKeys from '../services/ServiceEventKeys';
import * as User from '../../domain/models/mongodb/mongoose/User';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as EndedMatch from '../../domain/models/mongodb/mongoose/EndedMatch';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';

import * as identityDTOs from '../DTOs/identity';
import * as gameDTOs from '../DTOs/game';
import * as chatDTOs from '../DTOs/chat';

import chalk from 'chalk';
import RoutesBase from './RoutesBase';
import * as MatchSettings from '../../domain/models/mongodb/mongoose/MatchSettings';
//import * as BattleFieldSettings from '../../domain/models/mongodb/mongoose/BattleFieldSettings';
import * as MatchPlayerSide from '../../domain/models/mongodb/mongoose/MatchPlayerSide';
import * as ShipTypeAvailability from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipTypeAvailability } from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipPlacement } from '../../domain/models/mongodb/mongoose/ShipPlacement';
import DataManager from '../DataManager';

export default class PendingMatchesRoutes extends RoutesBase {

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._router.post(
            "/",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                if (!request.user) {
                    response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                    return;
                }

                let responseData: net.HttpMessage<string> = null;

                const userJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);

                const pendingMatchCriteria = {
                    PlayerId: userObjectId
                } as utilsV2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

                DataManager.HasOpenMatches(userObjectId)
                    .then((hasOpenMatches) => {

                        // if the user is already playing
                        if (hasOpenMatches) {
                            responseData = new net.HttpMessage(null, "You are already playing!"); // TODO: switch to specific error codes
                            response
                                .status(httpStatusCodes.FORBIDDEN)
                                .json(responseData);
                            return;
                        }

                        // if the user has no pending matches / matches

                        const pendingMatchSkel = pendingMatchCriteria;

                        PendingMatch
                            .create(pendingMatchSkel)
                            .save()
                            .then((newPendingMatch) => {

                                this._socketIOServer.emit(ServiceEventKeys.PendingMatchesChanged);

                                responseData = new net.HttpMessage(newPendingMatch.id);
                                response
                                    .status(httpStatusCodes.CREATED)
                                    .json(responseData);
                            })
                            .catch((error: mongodb.MongoError) => {
                                responseData = new net.HttpMessage(null, error.message);
                                response
                                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                    .json(responseData);
                            });
                    })
                    .catch((error) => {
                        // TODO: handle
                        console.log(chalk.red("+++ Why are we here?"));
                        throw new Error("WTF");
                    });
            }
        );

        this._router.delete(
            "/:" + RoutingParamKeys.pendingMatchId,
            this._jwtValidator,
            async (request: express.Request, response: express.Response) => {

                if (!request.user) {
                    response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                    return;
                }

                let responseData: net.HttpMessage<boolean> = null;

                const userJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);

                const pendingMatchCriteria = {
                    PlayerId: userObjectId,
                    _id: new mongoose.Types.ObjectId(request.params[RoutingParamKeys.pendingMatchId])
                } as utilsV2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

                const pendingMatch = await PendingMatch.getModel().findOne(pendingMatchCriteria).exec();

                if (pendingMatch) {
                    const removedPendingMatch = await pendingMatch.remove();

                    if (removedPendingMatch) {
                        responseData = new net.HttpMessage(true);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);

                        this._socketIOServer.emit(ServiceEventKeys.PendingMatchesChanged);
                    }
                    else {
                        responseData = new net.HttpMessage(false, "Could not delete pending match");
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    }
                } else {
                    responseData = new net.HttpMessage(false, "Requested PendingMatch not found");
                    response
                        .status(httpStatusCodes.NOT_FOUND)
                        .json(responseData);
                }
            }
        );

        // TODO: ensure can't join a match if already playing
        this._router.put(
            "/:" + RoutingParamKeys.pendingMatchId,
            this._jwtValidator,
            async (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<string> = null;

                const pendingMatchId = request.params[RoutingParamKeys.pendingMatchId];

                if (!pendingMatchId) {
                    responseData = new net.HttpMessage(null, "Unable to find requested match");
                    return response
                        .status(httpStatusCodes.BAD_REQUEST)
                        .json(responseData);
                }

                const pendingMatch = await PendingMatch.getModel().findById(pendingMatchId).exec();

                if (!PendingMatch) {
                    console.log(chalk.red("Could not find requested pending match"));
                    responseData = new net.HttpMessage(null, "Unable to find requested pending match.");
                    return response
                        .status(httpStatusCodes.NOT_FOUND)
                        .json(responseData);
                }

                console.log(chalk.green("Pending match identified"));

                const jwtUser = (request.user as identityDTOs.IUserJWTPayload);
                const jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);

                // ensure the pending match is not trying to be joined by the same player who created it
                if (pendingMatch.PlayerId.equals(jwtUserObjectId)) {
                    responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
                    return response
                        .status(httpStatusCodes.FORBIDDEN)
                        .json(responseData);
                }

                const removedPendingMatch = await pendingMatch.remove();
                if (!removedPendingMatch) {
                    responseData = new net.HttpMessage(null, "Could not delete pending match.");
                    return response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }

                console.log(chalk.green("PendingMatch (id: " + removedPendingMatch._id.toHexString() + ") deleted"));

                this._socketIOServer.emit(ServiceEventKeys.PendingMatchesChanged);

                const newMatchSkel = {
                    FirstPlayerSide: {
                        PlayerId: pendingMatch.PlayerId
                    } as MatchPlayerSide.IMongooseMatchPlayerSide,
                    SecondPlayerSide: {
                        PlayerId: jwtUserObjectId
                    } as MatchPlayerSide.IMongooseMatchPlayerSide,
                    Settings: {
                        // TODO: use default settings
                        MinShipsDistance: 2,
                        BattleFieldHeight: 10,
                        BattleFieldWidth: 10,
                        AvailableShips: [
                            { ShipType: game.ShipType.Destroyer, Count: 4 },
                            { ShipType: game.ShipType.Submarine, Count: 2 },
                            { ShipType: game.ShipType.Battleship, Count: 2 },
                            { ShipType: game.ShipType.Carrier, Count: 1 } as ShipTypeAvailability.IMongooseShipTypeAvailability
                        ] as ReadonlyArray<IMongooseShipTypeAvailability>
                    } as MatchSettings.IMongooseMatchSettings
                } as Match.IMongooseMatch;

                const match = await Match.create(newMatchSkel).save();
                if (!match) {
                    console.log(chalk.red("SHITSTORM: PendingMatch found & deleted BUT couldn't create the Match D:"));

                    responseData = new net.HttpMessage(null, "PendingMatch deleted but couldn't create the Match D:");
                    return response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }

                const matchHexId = match._id.toHexString();
                console.log(chalk.green("New match created (id: " + matchHexId + ")"));

                console.log("Deleted pending match: " + removedPendingMatch.id);
                console.log("Created match: " + match.id);

                this._socketIOServer.emit(
                    ServiceEventKeys.pendingMatchJoined(
                        pendingMatch.PlayerId.toHexString(),
                        pendingMatch._id.toHexString())
                    , {
                        PendingMatchId: pendingMatch._id.toHexString(),
                        MatchId: matchHexId
                    } as gameDTOs.IPendingMatchJoinedEventDto);

                responseData = new net.HttpMessage(matchHexId);
                return response
                    .status(httpStatusCodes.CREATED)
                    .json(responseData);
            }
        );
    }
}