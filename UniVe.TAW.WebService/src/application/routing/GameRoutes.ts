import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as expressJwt from 'express-jwt';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as game from '../../infrastructure/game';
import * as game_client from '../../infrastructure/game.client';
import * as utils from '../../infrastructure/utils';
import * as utils_2_8 from '../../infrastructure/utils-2.8';

import RoutingParamKeys from './RoutingParamKeys';
import ServiceEventKeys from '../services/ServiceEventKeys';
import * as User from '../../domain/models/mongodb/mongoose/User';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';

import * as DTOs from '../DTOs';
import chalk from 'chalk';
import RoutesBase from './RoutesBase';
import * as MatchSettings from '../../domain/models/mongodb/mongoose/MatchSettings';
//import * as BattleFieldSettings from '../../domain/models/mongodb/mongoose/BattleFieldSettings';
import * as MatchPlayerSide from '../../domain/models/mongodb/mongoose/MatchPlayerSide';
import * as  ShipTypeAvailability from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipTypeAvailability } from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import { IMongooseShipPlacement } from '../../domain/models/mongodb/mongoose/ShipPlacement';
import * as cors from 'cors';

export default class GameRoutes extends RoutesBase {

    private readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());

        this._router.get(
            "/canCreateMatch",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<boolean> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

                this.hasOpenMatches(userObjectId)
                    .then((hasOpenMatches) => {

                        responseData = new net.HttpMessage(!hasOpenMatches);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error) => {
                        // TODO: handle
                        console.log(chalk.red("+++ Why are we here?"));
                        throw new Error("WTF");
                    });
            }
        );

        this._router.get(
            "/playables",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IPlayablesDto> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                this.getPlayables(userObjectId)
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

        this._router.post(
            "/createPendingMatch",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                if (!request.user) {
                    response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                    return;
                }

                let responseData: net.HttpMessage<string> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

                const pendingMatchCriteria = {
                    PlayerId: userObjectId
                } as utils_2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

                this.hasOpenMatches(userObjectId)
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

        this._router.post(
            "/closePendingMatch" + "/:" + RoutingParamKeys.PendingMatchId,
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                if (!request.user) {
                    response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                    return;
                }

                let responseData: net.HttpMessage<boolean> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

                const pendingMatchCriteria = {
                    PlayerId: userObjectId,
                    _id: new mongoose.Types.ObjectId(request.params[RoutingParamKeys.PendingMatchId])
                } as utils_2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

                PendingMatch
                    .getModel()
                    .findOne(pendingMatchCriteria)
                    .then((pendingMatch) => {

                        if (pendingMatch) {
                            pendingMatch
                                .remove()
                                .then(result => {
                                    responseData = new net.HttpMessage(true);
                                    response
                                        .status(httpStatusCodes.OK)
                                        .json(responseData);
                                })
                                .catch((error: mongodb.MongoError) => {
                                    responseData = new net.HttpMessage(false, error.message);
                                    response
                                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                        .json(responseData);
                                });
                        }
                        else {
                            responseData = new net.HttpMessage(false, "Requested PendingMatch not found");
                            response
                                .status(httpStatusCodes.NOT_FOUND)
                                .json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(false, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
            }
        );

        // TODO: ensure can't join a match if already playing
        this._router.post(
            "/joinPendingMatch/:" + RoutingParamKeys.PendingMatchId,
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<string> = null;

                const pendingMatchId = request.params[RoutingParamKeys.PendingMatchId];

                if (!pendingMatchId) {
                    responseData = new net.HttpMessage(null, "Unable to find requested match");
                    response
                        .status(httpStatusCodes.BAD_REQUEST)
                        .json(responseData);
                    return;
                }

                PendingMatch.getModel()
                    .findById(pendingMatchId)
                    .then((pendingMatch) => {

                        console.log(chalk.green("Pending match identified"));

                        const jwtUser = (request.user as DTOs.IUserJWTData);
                        const jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);

                        // ensure the pending match is not trying to be joined by the same player who created it
                        if (pendingMatch.PlayerId.equals(jwtUserObjectId)) {
                            responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
                            response
                                .status(httpStatusCodes.FORBIDDEN)
                                .json(responseData);

                            return;
                        }

                        pendingMatch.remove()
                            .then((deletedPendingMatch) => {

                                console.log(chalk.green("PendingMatch (id: " + deletedPendingMatch._id.toHexString() + ") deleted"));

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

                                Match
                                    .create(newMatchSkel)
                                    .save()
                                    .then((createdMatch) => {

                                        const matchHexId = createdMatch._id.toHexString();
                                        console.log(chalk.green("New match created (id: " + matchHexId + ")"));

                                        this._socketIOServer.emit(ServiceEventKeys.MatchReady, { MatchId: matchHexId } as DTOs.IMatchReadyEventDto);

                                        responseData = new net.HttpMessage(matchHexId);
                                        response
                                            .status(httpStatusCodes.CREATED)
                                            .json(responseData);
                                    })
                                    // error when creating the match
                                    .catch((error: mongodb.MongoError) => {

                                        console.log(chalk.red("SHITSTORM: PendingMatch found & deleted BUT couldn't create the Match D:"));

                                        responseData = new net.HttpMessage(null, "PendingMatch deleted but couldn't create the real Match! Reason: " + error.message);
                                        response
                                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                            .json(responseData);
                                    });
                            })
                            // couldn't delete pending match
                            .catch((error: mongodb.MongoError) => {
                                responseData = new net.HttpMessage(null, error.message);
                                response
                                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                    .json(responseData);
                            });
                    })
                    // if the provided id for the pending match to join is not found
                    .catch((error: mongodb.MongoError) => {

                        console.log(chalk.red("Could not find requested pending match"));
                        responseData = new net.HttpMessage(null, "Unable to find requested pending match. Reason: " + error.message);
                        response
                            .status(httpStatusCodes.NOT_FOUND)
                            .json(responseData);
                    });
            }
        );

        // // TODO: complete, check everything workd as expected 
        // this._router.get(
        //     "/newMatchSettings",
        //     this._jwtValidator,
        //     (request: express.Request, response: express.Response) => {

        //         const dnms = null; // new game.MatchSettings();
        //         const responseData = new net.HttpMessage(game.MatchSettingsFactory.createDefaultSettings());

        //         response
        //             //.type("application/json")
        //             .status(httpStatusCodes.OK)
        //             .send(responseData);
        //     }
        // );

        this._router.get(
            "/:" + RoutingParamKeys.MatchId,
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IMatchDto> = null;

                const matchId = request.params[RoutingParamKeys.MatchId];

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
                        responseData = new net.HttpMessage<DTOs.IMatchDto>(matchDto);
                        response
                            .status(httpStatusCodes.OK)
                            .json(matchDto);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage<DTOs.IMatchDto>(null, error.message);
                        response
                            .status(httpStatusCodes.NOT_FOUND)
                            .json(responseData);
                    });
            }
        );

        this._router.get(
            "/:" + RoutingParamKeys.MatchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchConfigStatus> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchHexId = request.params[RoutingParamKeys.MatchId];
                const matchObjectId = new mongoose.Types.ObjectId(matchHexId);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
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
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(null, "You cannot access to matches you're not playing!");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    })
            });

        // TODO: validare la config che arriva!!!
        this._router.post(
            "/:" + RoutingParamKeys.MatchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchConfigStatus> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchHexId = request.params[RoutingParamKeys.MatchId];
                const matchObjectId = new mongoose.Types.ObjectId(matchHexId);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
                        }
                        else if (!match.FirstPlayerSide.PlayerId.equals(userObjectId) && !match.SecondPlayerSide.PlayerId.equals(userObjectId)) {
                            responseData = new net.HttpMessage(null, "You are not authorized to intervene in this match");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                            return;
                        }

                        const wasConfigSuccessful = match.configFleet(userObjectId, request.body as IMongooseShipPlacement[]);

                        if (match.areBothConfigured() && !match.StartDateTime) {
                            match.StartDateTime = new Date();
                            const rb = utils.getRandomBoolean();
                            if (rb == true) {
                                match.InActionPlayerId = match.FirstPlayerSide.PlayerId;
                            }
                            else {
                                match.InActionPlayerId = match.SecondPlayerSide.PlayerId;
                            }
                            match.save();
                            const matchStartedEventKey = ServiceEventKeys.matchEventForUser(userJWTData.Id, matchHexId, ServiceEventKeys.MatchStarted);
                            this._socketIOServer.emit(matchStartedEventKey, {
                                MatchId: match._id.toHexString(),
                                InActionPlayerId: match.InActionPlayerId.toHexString()
                            } as DTOs.IMatchStartedEventDto);

                        } else {
                            match.save();
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
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(
                                ownSideMatchConfigStatus,
                                "Match is already configured and cannot be changed");

                            response.status(httpStatusCodes.LOCKED).json(responseData); // TODO: return info instead of http error response
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match with specified player";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.OK).json(responseData);
                    });
            }
        );

        this._router.get(
            "/:" + RoutingParamKeys.MatchId + "/ownSideMatchStatus",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnSideMatchStatus> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.MatchId]);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
                        }

                        const ownSide = match.getOwnerMatchPlayerSide(userObjectId);

                        if (ownSide) {

                            const enemySide = match.getEnemyMatchPlayerSide(userObjectId);
                            const ownSideMatchStatusDto = {
                                IsConfigNeeded: !ownSide.isConfigured(match.Settings),
                                IsMatchStarted: match.StartDateTime != null,
                                EnemyId: enemySide.PlayerId.toHexString()
                            } as DTOs.IOwnSideMatchStatus;

                            responseData = new net.HttpMessage(ownSideMatchStatusDto);
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(null, "You cannot access to matches you're not playing!");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

        this._router.get(
            "/:" + RoutingParamKeys.MatchId + "/ownTurnInfo",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IOwnTurnInfoDto> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.MatchId]);

                const userModel = User.getModel();

                Match.getModel()
                    .findById(matchObjectId)
                    .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                    .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
                        }

                        const enemySide = match.getEnemyMatchPlayerSide(userObjectId);
                        // const enemySide = (match.FirstPlayerSide.PlayerId as any as User.IMongooseUser)._id.equals(userObjectId)
                        //     ? match.FirstPlayerSide
                        //     : ((match.SecondPlayerSide.PlayerId as any as User.IMongooseUser)._id.equals(userObjectId)
                        //         ? match.SecondPlayerSide
                        //         : null);

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
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(null, "You cannot access to matches you're not playing!");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

        this._router.post(
            "/:" + RoutingParamKeys.MatchId + "/singleShot",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IAttackResultDto> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.MatchId]);
                const singleShotAction = request.body as game.ISingleShotMatchAction;

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
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
                        }
                        catch (ex) {
                            console.log(chalk.red(ex));
                            responseData = new net.HttpMessage(null, JSON.stringify(ex));
                            response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    })
            });

        this._router.get(
            "/:" + RoutingParamKeys.MatchId + "/enemyTurnInfo",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<DTOs.IEnemyTurnInfoDto> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.MatchId]);

                const userModel = User.getModel();

                Match.getModel()
                    .findById(matchObjectId)
                    .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                    .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage(null, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
                        }

                        const ownSide = match.getOwnerMatchPlayerSide(userObjectId);
                        // const enemySide = (match.FirstPlayerSide.PlayerId as any as User.IMongooseUser)._id.equals(userObjectId)
                        //     ? match.FirstPlayerSide
                        //     : ((match.SecondPlayerSide.PlayerId as any as User.IMongooseUser)._id.equals(userObjectId)
                        //         ? match.SecondPlayerSide
                        //         : null);

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
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(null, "You cannot access to matches you're not playing!");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(null, msg);
                        response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(responseData);
                    });
            });

    }

    private getCanUserInterveneInMatch(playerId: mongoose.Types.ObjectId, matchId: mongoose.Types.ObjectId) {
        if (playerId == null || matchId == null)
            throw new Error("playerId & matchId cannot be null");

        return Match.getModel().findById(matchId)
            .then(match => {
                return match && (match.FirstPlayerSide.PlayerId === playerId || match.SecondPlayerSide.PlayerId === playerId);
            })
            .catch((error: mongodb.MongoError) => {
                console.log(chalk.red("error looking for specified match with specified player"));
                throw new Error("error looking for specified match with specified player");
            });
    }

    private getPlayables(userId: mongoose.Types.ObjectId) {

        const playables = {} as DTOs.IPlayablesDto;

        // Match.getModel().find().then(matches => {
        //     const x = matches.map(m => {
        //         return {
        //             matchId: m._id,
        //             first: m.FirstPlayerSide.PlayerId,
        //             second: m.SecondPlayerSide.PlayerId,
        //             cazzo: m.FirstPlayerSide.PlayerId.equals(userId) || m.SecondPlayerSide.PlayerId.equals(userId)
        //         };
        //     });
        // });

        return this.getUsersPendingMatch(userId)
            .then(pendingMatch => {

                if (pendingMatch) {
                    playables.PendingMatchId = pendingMatch.id;
                }

                return this.getUsersPlayingMatch(userId)
                    .then(playingMatch => {

                        if (playingMatch != null) {
                            playables.PlayingMatch = {
                                Id: playingMatch._id.toHexString(),
                                //Settings: playingMatch.Settings.
                            } as DTOs.IMatchSnapshotDto;
                        }
                        playables.CanCreateMatch = (playables.PendingMatchId == null && playables.PlayingMatch == null);

                        // if can't create a match it means can't join, then it's useless to query joinable matches
                        if (!playables.CanCreateMatch) {
                            return playables;
                        }

                        return PendingMatch.getModel()
                            .find({ PlayerId: { $ne: userId } })
                            .populate({ path: "PlayerId", model: User.getModel() })
                            .then(joinableMatches => {

                                playables.JoinableMatches = joinableMatches.map(jm => {

                                    const creator = jm.PlayerId as any as User.IMongooseUser;
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

                                return playables;
                            })
                            .catch((error: mongodb.MongoError) => {
                                console.log(error);
                                return null as DTOs.IPlayablesDto;
                            });
                    })
                    .catch((error: mongodb.MongoError) => {
                        console.log(error);
                        return null as DTOs.IPlayablesDto;
                    });
            })
            .catch((error: mongodb.MongoError) => {
                console.log(error);
                return null as DTOs.IPlayablesDto;
            });
    }

    private getUsersPlayingMatch(userId: mongoose.Types.ObjectId) {

        const matchCriteria1 = {
            FirstPlayerSide: {
                PlayerId: userId
            }
        } as utils_2_8.Mutable<Match.IMongooseMatch>;
        const matchCriteria2 = {
            SecondPlayerSide: {
                PlayerId: userId
            }
        } as utils_2_8.Mutable<Match.IMongooseMatch>;

        return Match.getModel()
            .findOne({ $or: [{ "FirstPlayerSide.PlayerId": userId }, { "SecondPlayerSide.PlayerId": userId }] })
            // .populate("InActionPlayerId")
            // .populate("FirstPlayerSide.PlayerId")
            // .populate("SecondPlayerSide.PlayerId")
            .then((playingMatch) => {

                return playingMatch;
                // if (playingMatch == null)
                //     return null;

                // const enemySide = playingMatch.getEnemyMatchPlayerSide(userId);

                // return {
                //     Id: playingMatch.id.toHexString(),
                //     Enemy: {
                //         Id: enemySide.PlayerId.toHexString(),

                //         // TODO: complete

                //         //Username: enemySide.PlayerId.Username
                //         // Country
                //         //Age: enemySide.Plauer

                //     } as DTOs.IUserDto

                // } as DTOs.IPlayingMatchDto;
            })
            .catch((error) => {
                // TODO: handle
                console.log(chalk.red("+++ Why are we here?"));
                throw new Error("WTF");
            });
    }

    private getUsersPendingMatch(userId: mongoose.Types.ObjectId) {

        const criteria = {
            PlayerId: userId
        } as utils_2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

        return PendingMatch.getModel()
            .findOne(criteria)
            .then((pendingMatch) => {
                return pendingMatch;
            })
            .catch((error) => {
                // TODO: handle
                console.log(chalk.red("+++ Why are we here?"));
                throw new Error("WTF");
            });
    }

    // TODO: review if it works with id filtering
    private hasOpenMatches(userId: mongoose.Types.ObjectId): Promise<boolean> {

        const pendingMatchCriteria = { PlayerId: userId } as utils_2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

        return this.getUsersPendingMatch(userId)
            .then((existingPendingMatch) => {

                if (existingPendingMatch)
                    return true;

                return this.getUsersPlayingMatch(userId)
                    .then((existingMatch) => {
                        return existingMatch != null;
                    })
                    .catch((error) => {
                        // TODO: handle
                        console.log(chalk.red("+++ Why are we here?"));
                        throw new Error("WTF");
                    });
            })
            .catch((error) => {
                // TODO: handle
                console.log(chalk.red("+++ Why are we here?"));
                throw new Error("WTF");
            });
    }
}