import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as expressJwt from 'express-jwt';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as game from '../../infrastructure/game';
import * as utils from '../../infrastructure/utils-2.8';

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

export default class GameRoutes extends RoutesBase {

    private readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
                return res.status(httpStatusCodes.OK).json({});
            }
            next();
        });

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
                } as utils.Mutable<PendingMatch.IMongoosePendingMatch>;

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
                        const newPendingMatch = PendingMatch.create(pendingMatchSkel);

                        PendingMatch
                            .getModel()
                            .create(newPendingMatch)
                            .then((newPendingMatch) => {
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
                } as utils.Mutable<PendingMatch.IMongoosePendingMatch>;

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
                        if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
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
                                        MinShipsDistance: 2,
                                        BattleFieldHeight: 10,
                                        BattleFieldWidth: 10,
                                        AvailableShips: [
                                            { ShipType: game.ShipType.Destroyer, Count: 4 } as ShipTypeAvailability.IMongooseShipTypeAvailability,
                                            { ShipType: game.ShipType.Submarine, Count: 2 } as ShipTypeAvailability.IMongooseShipTypeAvailability,
                                            { ShipType: game.ShipType.Battleship, Count: 2 } as ShipTypeAvailability.IMongooseShipTypeAvailability,
                                            { ShipType: game.ShipType.Carrier, Count: 1 } as ShipTypeAvailability.IMongooseShipTypeAvailability
                                        ] as ReadonlyArray<IMongooseShipTypeAvailability>
                                    } as MatchSettings.IMongooseMatchSettings
                                } as Match.IMongooseMatch;

                                Match
                                    .create(newMatchSkel)
                                    .save()
                                    .then((createdMatch) => {

                                        console.log(chalk.green("New match created (id:" + createdMatch._id.toHexString() + ")"));

                                        this._socketIOServer.emit(ServiceEventKeys.MatchReady, { MatchId: createdMatch._id.toHexString() } as DTOs.IMatchReadyEventDto);

                                        responseData = new net.HttpMessage(createdMatch._id.toHexString());
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

        // TODO: complete, check everything workd as expected 
        this._router.get(
            "/newMatchSettings",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                const dnms = null; // new game.MatchSettings();
                const responseData = new net.HttpMessage(game.MatchSettingsFactory.createDefaultSettings());

                response
                    //.type("application/json")
                    .status(httpStatusCodes.OK)
                    .send(responseData);
            }
        );

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

        this._router.post(
            "/:" + RoutingParamKeys.MatchId + "/config",
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                let responseData: net.HttpMessage<boolean> = null;

                const userJWTData = (request.user as DTOs.IUserJWTData);
                const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                const matchObjectId = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.MatchId]);

                Match.getModel()
                    .findById(matchObjectId)
                    .then(match => {

                        if (!match) {
                            responseData = new net.HttpMessage<boolean>(false, "Could not find requested match");
                            response.status(httpStatusCodes.NOT_FOUND).json(responseData);
                            return;
                        }
                        else if (!match.FirstPlayerSide.PlayerId.equals(userObjectId) && !match.SecondPlayerSide.PlayerId.equals(userObjectId)) {
                            responseData = new net.HttpMessage<boolean>(false, "You are not authorized to intervene in this match");
                            response.status(httpStatusCodes.FORBIDDEN).json(responseData);
                            return;
                        }

                        const wasConfigSuccessful = match.configFleet(userObjectId, request.body as IMongooseShipPlacement[]);

                        if (wasConfigSuccessful) {
                            responseData = new net.HttpMessage(wasConfigSuccessful);
                            response.status(httpStatusCodes.OK).json(responseData);
                        }
                        else {
                            responseData = new net.HttpMessage(wasConfigSuccessful, "Match is already configured and cannot be changed");
                            response.status(httpStatusCodes.LOCKED).json(responseData); // TODO: return info instead of http error response
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        const msg = "error looking for specified match with specified player";
                        console.log(chalk.red(msg));
                        //throw new Error("error looking for specified match with specified player");
                        responseData = new net.HttpMessage(false, msg);
                        response.status(httpStatusCodes.OK).json(responseData);
                    })
            }
        );

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

        const matchCriteria1 = {} as utils.Mutable<Match.IMongooseMatch>;
        (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = userId;

        const matchCriteria2 = {} as utils.Mutable<Match.IMongooseMatch>;
        (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = userId;

        return Match.getModel()
            // TODO: fix OR in criteria
            .findOne({ $or: [matchCriteria1, matchCriteria2] })
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

        const criteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        criteria.PlayerId = userId;

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

    private hasOpenMatches(userId: mongoose.Types.ObjectId): Promise<boolean> {

        const pendingMatchCriteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        pendingMatchCriteria.PlayerId = userId;

        return PendingMatch
            .getModel()
            // ensure the user has no pending matches opened
            .findOne(pendingMatchCriteria)
            .then((existingPendingMatch) => {

                if (existingPendingMatch) {
                    return true;
                }

                // ensure the user isn't already playing
                const matchCriteria1 = {} as utils.Mutable<Match.IMongooseMatch>;
                (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = pendingMatchCriteria.PlayerId;

                const matchCriteria2 = {} as utils.Mutable<Match.IMongooseMatch>;
                (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = pendingMatchCriteria.PlayerId;

                return Match.getModel()
                    .findOne({ $or: [matchCriteria1, matchCriteria2] })
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