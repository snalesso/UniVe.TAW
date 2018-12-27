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
import * as MatchPlayerSide from '../../domain/models/mongodb/mongoose/MatchPlayerSide';
import * as ShipTypeAvailability from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipTypeAvailability } from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipPlacement } from '../../domain/models/mongodb/mongoose/ShipPlacement';
import PendingMatchesRoutes from './PendingMatchesRoutes';
import DataManager from '../DataManager';

export default class MatchesRoutes extends RoutesBase {

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._router.get(
            "/:" + RoutingParamKeys.matchId,
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<gameDTOs.IMatchDto> = null;

                const userJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.matchId]);

                const userModel = User.getModel();

                Match.getModel()
                    .findById(matchObjectId)
                    .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                    .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            return response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                        }

                        const ownSide = match.getOwnerMatchPlayerSide(userObjectId);

                        if (ownSide) {

                            const ownCells: game_client.IOwnBattleFieldCell[][] = [];

                            for (let x = 0; x < ownSide.BattleFieldCells.length; x++) {

                                ownCells[x] = [];

                                for (let y = 0; y < ownSide.BattleFieldCells[x].length; y++) {

                                    ownCells[x].push({
                                        Coord: {
                                            X: x,
                                            Y: y
                                        },
                                        ShipType: ownSide.BattleFieldCells[x][y].ShipType,
                                        Status: (ownSide.BattleFieldCells[x][y].FireReceivedDateTime)
                                            ? game_client.OwnBattleFieldCellStatus.Hit
                                            : game_client.OwnBattleFieldCellStatus.Untouched
                                    } as game_client.IOwnBattleFieldCell);
                                }
                            }

                            const enemySide = match.getEnemyMatchPlayerSide(userObjectId);
                            const enemy = enemySide.PlayerId as any as User.IMongooseUser;
                            const matchDto = {
                                Id: match._id.toHexString(),

                                Settings: {
                                    BattleFieldWidth: match.Settings.BattleFieldWidth,
                                    BattleFieldHeight: match.Settings.BattleFieldHeight,
                                    MinShipsDistance: match.Settings.MinShipsDistance,
                                    ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                                } as game.IMatchSettings,

                                StartDateTime: match.StartDateTime,
                                EndDateTime: match.EndDateTime,

                                CanFire: match.InActionPlayerId && match.InActionPlayerId.equals(userObjectId),
                                DidIWin: match.EndDateTime != null && match.InActionPlayerId.equals(userObjectId),

                                OwnSide: {
                                    IsConfigured: ownSide.isConfigured(match.Settings),
                                    Cells: ownCells
                                },
                                EnemySide: {
                                    Player: {
                                        Id: enemy._id.toHexString(),
                                        Username: enemy.Username
                                    },
                                    Cells: enemySide.BattleFieldCells.map(col => col.map(row =>
                                        (!row.FireReceivedDateTime
                                            ? (game_client.EnemyBattleFieldCellStatus.Unknown)
                                            : (row.ShipType == game.ShipType.NoShip
                                                ? game_client.EnemyBattleFieldCellStatus.Water
                                                : game_client.EnemyBattleFieldCellStatus.HitShip))))

                                }

                            } as gameDTOs.IMatchDto;

                            responseData = new net.HttpMessage(matchDto);
                            return response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(null, "You cannot access to matches you're not playing!");
                            return response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

        this._router.post(
            "/:" + RoutingParamKeys.matchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<boolean> = null;

                const currentUserJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const currentUserObjectId = new mongoose.Types.ObjectId(currentUserJWTPayload.Id);
                const matchHexId = request.params[RoutingParamKeys.matchId];
                const matchObjectId = new mongoose.Types.ObjectId(matchHexId);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            return response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                        }
                        if (!match.FirstPlayerSide.PlayerId.equals(currentUserObjectId) && !match.SecondPlayerSide.PlayerId.equals(currentUserObjectId)) {
                            responseData = new net.HttpMessage(null, "You are not authorized to intervene in this match");
                            return response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }

                        // TODO: validare la config che arriva!!!

                        const wasConfigSuccessful = match.configFleet(currentUserObjectId, request.body as IMongooseShipPlacement[]);
                        match.save();

                        // const configResultDto = {
                        //     IsConfigured: match.getOwnerMatchPlayerSide(currentUserObjectId).isConfigured(match.Settings),
                        //     MatchStartDateTime: match.StartDateTime
                        // } as gameDTOs.IMatchConfigResultDto;

                        if (!wasConfigSuccessful) {
                            responseData = new net.HttpMessage(false, "Match is already configured and cannot be changed");
                            return response.status(httpStatusCodes.LOCKED).json(responseData);
                        }

                        // send response

                        responseData = new net.HttpMessage(true);
                        response.status(httpStatusCodes.OK).json(responseData);

                        // send match started event

                        if (match.StartDateTime) {
                            this._socketIOServer.emit(
                                ServiceEventKeys.matchEventForUser(match.FirstPlayerSide.PlayerId.toHexString(), matchHexId, ServiceEventKeys.MatchStarted),
                                {
                                    InActionPlayerId: match.InActionPlayerId.toHexString(),
                                    StartDateTime: match.StartDateTime
                                } as gameDTOs.IMatchStartedEventDto);
                            this._socketIOServer.emit(
                                ServiceEventKeys.matchEventForUser(match.SecondPlayerSide.PlayerId.toHexString(), matchHexId, ServiceEventKeys.MatchStarted),
                                {
                                    InActionPlayerId: match.InActionPlayerId.toHexString(),
                                    StartDateTime: match.StartDateTime
                                } as gameDTOs.IMatchStartedEventDto);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match with specified player";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.OK).json(responseData);
                    });
            }
        );

        this._router.post(
            "/:" + RoutingParamKeys.matchId + "/singleShot",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<gameDTOs.IAttackResultDto> = null;

                const userJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                const loggedUserObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.matchId]);
                const singleShotAction = request.body as game.ISingleShotMatchAction;

                Match.getModel()
                    .findById(matchObjectId)
                    .then(async match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            return response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                        }

                        try {
                            const didHitAShip = match.fire(loggedUserObjectId, singleShotAction.Coord);
                            const enemyField = match.getEnemyMatchPlayerSide(loggedUserObjectId);

                            match.save();

                            const enemyCellChanges: game_client.IEnemyBattleFieldCell[] = [
                                {
                                    Coord: singleShotAction.Coord,
                                    Status: didHitAShip
                                        ? game_client.EnemyBattleFieldCellStatus.HitShip
                                        : game_client.EnemyBattleFieldCellStatus.Water
                                }];

                            const attackResultDto = {
                                EnemyFieldCellChanges: enemyCellChanges,
                                CanFireAgain: (match.StartDateTime != null) && (match.EndDateTime == null) && match.InActionPlayerId.equals(loggedUserObjectId),
                                MatchEndDateTime: match.EndDateTime,
                                DidWin: (match.StartDateTime != null) && (match.EndDateTime != null) && match.InActionPlayerId.equals(loggedUserObjectId)
                            } as gameDTOs.IAttackResultDto;

                            this._socketIOServer.emit(
                                ServiceEventKeys.matchEventForUser(enemyField.PlayerId.toHexString(), match._id.toHexString(), ServiceEventKeys.YouGotShot),
                                {
                                    OwnFieldCellChanges: enemyCellChanges.map(change => ({
                                        Coord: change.Coord,
                                        Status:
                                            (change.Status == game_client.EnemyBattleFieldCellStatus.Unknown
                                                || change.Status == game_client.EnemyBattleFieldCellStatus.Ship)
                                                ? game_client.OwnBattleFieldCellStatus.Untouched
                                                : game_client.OwnBattleFieldCellStatus.Hit
                                    } as game_client.IOwnBattleFieldCell)),
                                    IsOwnTurn: (match.StartDateTime != null) && (match.EndDateTime == null) && match.InActionPlayerId.equals(loggedUserObjectId)
                                } as gameDTOs.IYouGotShotEventDto);

                            responseData = new net.HttpMessage(attackResultDto);
                            response.status(httpStatusCodes.OK).json(responseData);

                            // ------------ handle match ended -----------------

                            if (match.EndDateTime) {

                                const newEndedMatch = {
                                    CreationDateTime: match.CreationDateTime,
                                    StartDateTime: match.StartDateTime,
                                    EndDateTime: match.EndDateTime,
                                    FirstPlayerSide: match.FirstPlayerSide,
                                    SecondPlayerSide: match.SecondPlayerSide,
                                    WinnerId: match.InActionPlayerId,
                                    Settings: match.Settings
                                } as utilsV2_8.Mutable<EndedMatch.IMongooseEndedMatch>;

                                let endedMatch = await EndedMatch
                                    .create(newEndedMatch)
                                    .save();
                                let removedMatch = await match.remove();

                                const matchEndedEventDto = {
                                    EndDateTime: endedMatch.EndDateTime,
                                    WinnerId: endedMatch.WinnerId.toHexString(),
                                    IsResigned: false
                                } as gameDTOs.IMatchEndedEventDto;

                                this._socketIOServer.emit(
                                    ServiceEventKeys.matchEventForUser(
                                        match.getEnemyMatchPlayerSide(loggedUserObjectId).PlayerId.toHexString(),
                                        match._id.toHexString(),
                                        ServiceEventKeys.MatchEnded),
                                    matchEndedEventDto);
                            }
                        }
                        catch (ex) {
                            console.log(chalk.red(ex));
                            responseData = new net.HttpMessage(null, JSON.stringify(ex));
                            return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    })
            });

    }
}