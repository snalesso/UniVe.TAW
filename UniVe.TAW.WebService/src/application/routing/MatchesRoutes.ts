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

import * as DTOs from '../DTOs';
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

                let responseData: net.HttpMessage<DTOs.IMatchDto> = null;

                const matchId = request.params[RoutingParamKeys.matchId];

                Match.getModel()
                    .findById(matchId)
                    // .populate("FirstPlayerSide.PlayerId")
                    // .populate("SecondPlayerSide.PlayerId")
                    // .populate("InActionPlayerId")
                    .then((match) => {

                        const matchDto: DTOs.IMatchDto = {
                            Id: match.id,
                            FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
                            SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
                            CreationDateTime: match.CreationDateTime,
                            Settings: {
                                BattleFieldWidth: match.Settings.BattleFieldWidth,
                                BattleFieldHeight: match.Settings.BattleFieldHeight,
                                MinShipsDistance: match.Settings.MinShipsDistance,
                                ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                            } as game.IMatchSettings
                        };
                        responseData = new net.HttpMessage(matchDto);
                        return response
                            .status(httpStatusCodes.OK)
                            .json(matchDto);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        return response
                            .status(httpStatusCodes.NOT_FOUND)
                            .json(responseData);
                    });
            }
        );

        this._router.get(
            "/:" + RoutingParamKeys.matchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchConfigStatus> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
                const matchHexId = request.params[RoutingParamKeys.matchId];
                const matchObjectId = new mongoose.Types.ObjectId(matchHexId);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            return response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                        }

                        const ownSide = match.getOwnerMatchPlayerSide(userObjectId);

                        if (ownSide) {
                            const ownMatchSideConfigStatusDto = {
                                IsConfigNeeded: ownSide.BattleFieldCells.length < match.Settings.BattleFieldWidth,
                                Settings: {
                                    BattleFieldWidth: match.Settings.BattleFieldWidth,
                                    BattleFieldHeight: match.Settings.BattleFieldHeight,
                                    MinShipsDistance: match.Settings.MinShipsDistance,
                                    ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                                } as game.IMatchSettings
                            } as DTOs.IOwnSideMatchConfigStatus;

                            responseData = new net.HttpMessage(ownMatchSideConfigStatusDto);
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
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    })
            });

        // TODO: validare la config che arriva!!!
        this._router.post(
            "/:" + RoutingParamKeys.matchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchConfigStatus> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
                const matchHexId = request.params[RoutingParamKeys.matchId];
                const matchObjectId = new mongoose.Types.ObjectId(matchHexId);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            return response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                        }
                        else if (!match.FirstPlayerSide.PlayerId.equals(userObjectId) && !match.SecondPlayerSide.PlayerId.equals(userObjectId)) {
                            responseData = new net.HttpMessage(null, "You are not authorized to intervene in this match");
                            return response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }

                        const wasConfigSuccessful = match.configFleet(userObjectId, request.body as IMongooseShipPlacement[]);
                        match.save();

                        if (wasConfigSuccessful && match.StartDateTime) {
                            this._socketIOServer.emit(
                                ServiceEventKeys.matchEventForUser(match.FirstPlayerSide.PlayerId.toHexString(), matchHexId, ServiceEventKeys.MatchStarted),
                                {
                                    MatchId: match._id.toHexString(),
                                    InActionPlayerId: match.InActionPlayerId.toHexString()
                                } as DTOs.IMatchStartedEventDto);
                            this._socketIOServer.emit(
                                ServiceEventKeys.matchEventForUser(match.SecondPlayerSide.PlayerId.toHexString(), matchHexId, ServiceEventKeys.MatchStarted),
                                {
                                    MatchId: match._id.toHexString(),
                                    InActionPlayerId: match.InActionPlayerId.toHexString()
                                } as DTOs.IMatchStartedEventDto);
                        }

                        const ownSideMatchConfigStatus = {
                            IsConfigNeeded: !wasConfigSuccessful,
                            Settings: {
                                BattleFieldWidth: match.Settings.BattleFieldWidth,
                                BattleFieldHeight: match.Settings.BattleFieldHeight,
                                MinShipsDistance: match.Settings.MinShipsDistance,
                                ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                            } as game.IMatchSettings
                        } as DTOs.IOwnSideMatchConfigStatus;

                        if (wasConfigSuccessful) {
                            responseData = new net.HttpMessage(ownSideMatchConfigStatus);
                            return response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(
                                ownSideMatchConfigStatus,
                                "Match is already configured and cannot be changed");

                            return response.status(httpStatusCodes.LOCKED).json(responseData);
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

        this._router.get(
            "/:" + RoutingParamKeys.matchId + "/ownSideStatus",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchStatus> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
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

                            const enemySide = match.getEnemyMatchPlayerSide(userObjectId);
                            const enemy = enemySide.PlayerId as any as User.IMongooseUser;
                            const ownSideMatchStatusDto = {
                                IsConfigNeeded: !ownSide.isConfigured(match.Settings),
                                IsMatchStarted: match.StartDateTime != null,
                                Enemy: { Id: enemy._id.toHexString(), Username: enemy.Username },
                                DidIWin: match.EndDateTime != null && match.InActionPlayerId.equals(userObjectId),
                                DoIOwnMove: match.InActionPlayerId && match.InActionPlayerId.equals(userObjectId)
                            } as DTOs.IOwnSideMatchStatus;

                            responseData = new net.HttpMessage(ownSideMatchStatusDto);
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
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

        this._router.get(
            "/:" + RoutingParamKeys.matchId + "/ownTurnInfo",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnTurnInfoDto> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
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

                        const enemySide = match.getEnemyMatchPlayerSide(userObjectId);

                        if (enemySide) {

                            const enemyClientCells: game_client.EnemyBattleFieldCellStatus[][] = enemySide.BattleFieldCells.map(col => col.map(row =>
                                (!row.FireReceivedDateTime
                                    ? (game_client.EnemyBattleFieldCellStatus.Unknown) // TODO: add match-finished showing of non-hit ships
                                    : (row.ShipType == game.ShipType.NoShip
                                        ? game_client.EnemyBattleFieldCellStatus.Water
                                        : game_client.EnemyBattleFieldCellStatus.HitShip))));

                            const enemy = enemySide.PlayerId as any as User.IMongooseUser;
                            const inActionPlayer = match.InActionPlayerId as any as User.IMongooseUser;
                            const isOwnTurn = (match.StartDateTime != null) && (match.EndDateTime == null) && (inActionPlayer._id.equals(userObjectId));
                            const ownViewOfEnemySideDto = {
                                MatchId: match._id.toHexString(),
                                MatchSettings: {
                                    BattleFieldWidth: match.Settings.BattleFieldWidth,
                                    BattleFieldHeight: match.Settings.BattleFieldHeight,
                                    MinShipsDistance: match.Settings.MinShipsDistance,
                                    ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                                } as game.IMatchSettings,
                                MatchEndedDateTime: match.EndDateTime,
                                Enemy: {
                                    Id: enemy._id.toHexString(),
                                    Username: enemy.Username,
                                    CountryId: enemy.CountryId,
                                    Age: enemy.getAge()
                                } as DTOs.IUserDto,
                                EnemyField: enemyClientCells,
                                OwnsMove: isOwnTurn
                            } as DTOs.IOwnTurnInfoDto;

                            responseData = new net.HttpMessage(ownViewOfEnemySideDto);
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
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

        this._router.post(
            "/:" + RoutingParamKeys.matchId + "/singleShot",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IAttackResultDto> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
                const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
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
                            const didHitAShip = match.fire(userObjectId, singleShotAction.Coord);
                            const enemyField = match.getEnemyMatchPlayerSide(userObjectId);

                            match.save();

                            const enemyCellChanges: game_client.IEnemyBattleFieldCell[] = [
                                {
                                    Coord: singleShotAction.Coord,
                                    Status: didHitAShip
                                        ? game_client.EnemyBattleFieldCellStatus.HitShip
                                        : game_client.EnemyBattleFieldCellStatus.Water
                                }];

                            const enemyClientCells: game_client.EnemyBattleFieldCellStatus[][] = enemyField
                                .BattleFieldCells.map(col => col.map(row =>
                                    (!row.FireReceivedDateTime
                                        ? (game_client.EnemyBattleFieldCellStatus.Unknown) // TODO: add match-finished showing of non-hit ships
                                        : (row.ShipType == game.ShipType.NoShip
                                            ? game_client.EnemyBattleFieldCellStatus.Water
                                            : game_client.EnemyBattleFieldCellStatus.HitShip))));

                            const attackResultDto = {
                                NewEnemyField: enemyClientCells,
                                EnemyFieldCellChanges: enemyCellChanges,
                                IsMatchEnded: match.EndDateTime != null,
                                StillOwnsMove: (match.StartDateTime != null) && (match.EndDateTime == null) && match.InActionPlayerId.equals(userObjectId)
                            } as DTOs.IAttackResultDto;

                            // TODO: this event forces a FULL reload of the enemy field from server, create an ad hoc event which just tells "enemy hit water, its your turn"
                            this._socketIOServer.emit(ServiceEventKeys.matchEventForUser(enemyField.PlayerId.toHexString(), match._id.toHexString(), ServiceEventKeys.MatchUpdated));

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
                                    } as game_client.IOwnBattleFieldCell))
                                } as DTOs.IYouGotShotEventDto);

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

                                const mee = {
                                    MatchId: endedMatch._id.toHexString(),
                                    EndDateTime: endedMatch.EndDateTime,
                                    WinnerId: endedMatch.WinnerId.toHexString(),
                                    IsResigned: false
                                } as DTOs.IMatchEndedEventDto;

                                let matchEndedEventKey = ServiceEventKeys.matchEventForUser(match.FirstPlayerSide.PlayerId.toHexString(), match._id.toHexString(), ServiceEventKeys.MatchEnded);
                                this._socketIOServer.emit(matchEndedEventKey, mee);
                                matchEndedEventKey = ServiceEventKeys.matchEventForUser(match.SecondPlayerSide.PlayerId.toHexString(), match._id.toHexString(), ServiceEventKeys.MatchEnded);
                                this._socketIOServer.emit(matchEndedEventKey, mee);
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

        this._router.get(
            "/:" + RoutingParamKeys.matchId + "/enemyTurnInfo",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IEnemyTurnInfoDto> = null;

                const userJWTPayload = (request.user as DTOs.IUserJWTPayload);
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

                            const ownClientCells: game_client.IOwnBattleFieldCell[][] = [];

                            for (let x = 0; x < ownSide.BattleFieldCells.length; x++) {

                                ownClientCells[x] = [];

                                for (let y = 0; y < ownSide.BattleFieldCells[x].length; y++) {

                                    ownClientCells[x].push({
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

                            const inActionPlayer = match.InActionPlayerId as any as User.IMongooseUser;
                            const isEnemyTurn = (match.StartDateTime != null) && (match.EndDateTime == null) && (inActionPlayer._id.equals(userObjectId));
                            const ownViewOfOwnSideDto = {
                                MatchId: match._id.toHexString(),
                                MatchSettings: {
                                    BattleFieldWidth: match.Settings.BattleFieldWidth,
                                    BattleFieldHeight: match.Settings.BattleFieldHeight,
                                    MinShipsDistance: match.Settings.MinShipsDistance,
                                    ShipTypeAvailabilities: match.Settings.AvailableShips.map(as => ({ ShipType: as.ShipType, Count: as.Count } as game.IShipTypeAvailability))
                                } as game.IMatchSettings,
                                MatchEndedDateTime: match.EndDateTime,
                                OwnField: ownClientCells,
                                OwnsMove: isEnemyTurn
                            } as DTOs.IEnemyTurnInfoDto;

                            responseData = new net.HttpMessage(ownViewOfOwnSideDto);
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
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

    }
}