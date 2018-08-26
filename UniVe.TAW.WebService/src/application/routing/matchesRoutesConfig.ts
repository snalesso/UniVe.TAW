import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as expressJwt from 'express-jwt';

import * as net from '../../infrastructure/net';
import * as game from '../../infrastructure/game';
import * as utils from '../../infrastructure/utils-2.8';

import RoutingParamKeys from './RoutingParamKeys';
import * as User from '../../domain/models/mongodb/mongoose/User';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';

import * as DTOs from '../DTOs';
import chalk from 'chalk';

// TODO: rename to gameRoutesConfig?

const jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

const router: express.Router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(httpStatusCodes.OK).json({});
    }
    next();
});

function getUsersPlayingMatch(userId: mongoose.Types.ObjectId) {

    const matchCriteria1 = {} as utils.Mutable<Match.IMongooseMatch>;
    (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
    (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = userId;

    const matchCriteria2 = {} as utils.Mutable<Match.IMongooseMatch>;
    (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
    (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = userId;

    return Match.getModel()
        // TODO: fix OR in criteria
        .findOne(matchCriteria1/*, matchCriteria2*/)
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

function getUsersPendingMatch(userId: mongoose.Types.ObjectId) {

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

function hasOpenMatches(userId: mongoose.Types.ObjectId): Promise<boolean> {

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

router.get(
    "/canCreateMatch",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<boolean> = null;

        const userJWTData = (request.user as DTOs.IUserJWTData);
        const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

        hasOpenMatches(userObjectId)
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

const getPlayables = function (userId: mongoose.Types.ObjectId) /*: Promise<DTOs.IPlayablesDto>*/ {

    const playables = {} as DTOs.IPlayablesDto;

    return getUsersPendingMatch(userId)
        .then(pendingMatch => {

            if (pendingMatch) {
                playables.PendingMatchId = pendingMatch.id;
            }

            return getUsersPlayingMatch(userId)
                .then(playingMatch => {
                    if (playingMatch != null) {
                        playables.PlayingMatch = {
                            Id: playingMatch._id.toHexString(),
                            //Settings: playingMatch.Settings.
                        } as DTOs.IPlayingMatchDto;
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

router.get(
    "/playables",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.IPlayablesDto> = null;

        const userJWTData = (request.user as DTOs.IUserJWTData);
        const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
        const playables = getPlayables(userObjectId)
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

router.post(
    "/createPendingMatch",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        if (!request.user) {
            response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
            return;
        }

        let responseData: net.HttpMessage<string> = null;

        const userJWTData = (request.user as DTOs.IUserJWTData);
        const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

        const pendingMatchCriteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        pendingMatchCriteria.PlayerId = userObjectId;

        hasOpenMatches(userObjectId)
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

router.post(
    "/closePendingMatch" + "/:" + RoutingParamKeys.PendingMatchId,
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        if (!request.user) {
            response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
            return;
        }

        let responseData: net.HttpMessage<boolean> = null;

        const userJWTData = (request.user as DTOs.IUserJWTData);
        const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);

        const pendingMatchCriteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
        pendingMatchCriteria.PlayerId = userObjectId;
        pendingMatchCriteria._id = new mongoose.Types.ObjectId(request.params[RoutingParamKeys.PendingMatchId]);

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
router.post(
    "/join/:" + RoutingParamKeys.PendingMatchId,
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.IMatchDto> = null;

        const pendingMatchId = request.params[RoutingParamKeys.PendingMatchId];

        if (!pendingMatchId) {
            responseData = new net.HttpMessage<DTOs.IMatchDto>(null, "Unable to find requested match");
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

                // ensure the pending match is not joined by the same player who created it
                if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                    responseData = new net.HttpMessage<DTOs.IMatchDto>(null, "You cannot join your own match! -.-\"");
                    response
                        .status(httpStatusCodes.FORBIDDEN)
                        .json(responseData);
                    return;

                }
                const newMatchSkeleton = {} as utils.Mutable<Match.IMongooseMatch>;
                (newMatchSkeleton.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                (newMatchSkeleton.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = pendingMatch.PlayerId;
                (newMatchSkeleton.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                (newMatchSkeleton.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = jwtUserObjectId;

                Match
                    .create(newMatchSkeleton)
                    .save()
                    .then((createdMatch) => {

                        console.log(chalk.green("New match created"));

                        PendingMatch.getModel()
                            .findByIdAndRemove(pendingMatch._id)
                            .then((deletedPendingMatch) => {

                                console.log(chalk.green("Pending match deleted"));

                                responseData = new net.HttpMessage<DTOs.IMatchDto>(
                                    {
                                        Id: createdMatch.id,
                                        FirstPlayerId: createdMatch.FirstPlayerSide.PlayerId.toHexString(),
                                        SecondPlayerId: createdMatch.SecondPlayerSide.PlayerId.toHexString(),
                                        CreationDateTime: createdMatch.CreationDateTime
                                    } as DTOs.IMatchDto);

                                response
                                    .status(httpStatusCodes.CREATED)
                                    .json(responseData);
                            })
                            // match created but couldn't delete the original pending match :O
                            .catch((error: mongodb.MongoError) => {

                                console.log(chalk.red("Shit happening: pending match found, new match created, pending match not deleted D:"));

                                responseData = new net.HttpMessage<DTOs.IMatchDto>(
                                    null,
                                    "Unable to delete pendingMatch after creating the real match. Reason: " + error.message);
                                response
                                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                    .json(responseData);
                            });
                    })
                    // error when creating the match
                    .catch((error: mongodb.MongoError) => {

                        responseData = new net.HttpMessage<DTOs.IMatchDto>(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
            })
            // if the provided id for the pending match to join is not found
            .catch((error: mongodb.MongoError) => {

                console.log(chalk.red("Could not find requested pending match"));
                responseData = new net.HttpMessage<DTOs.IMatchDto>(
                    null,
                    "Unable to find requested pending match. Reason: " + error.message);
                response
                    .status(httpStatusCodes.NOT_FOUND)
                    .json(responseData);
            });
    }
);

// TODO: complete, check everything workd as expected 
router.get(
    "/newMatchSettings",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        const dnms = new game.MatchSettings();
        const responseData = new net.HttpMessage({
            MinShipDistance: dnms.MinShipsDistance,
            ShipTypeAvailability: dnms.AvailableShips.map(as => {
                return {
                    Count: as.Count,
                    ShipType: as.ShipType
                } as DTOs.IShipTypeAvailabilityDto;
            }),
            BattleFieldSettings: {
                BattleFieldWidth: dnms.BattleFieldSettings.BattleFieldWidth,
                BattleFieldHeight: dnms.BattleFieldSettings.BattleFieldHeight,

            } as DTOs.IBattleFieldSettingsDto
        } as DTOs.IMatchSettingsDto);

        response
            //.type("application/json")
            .status(httpStatusCodes.OK)
            .send(responseData);
    }
);

router.get(
    "/:" + RoutingParamKeys.MatchId,
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.IMatchDto> = null;

        const matchId = request.params[RoutingParamKeys.MatchId];

        Match.getModel()
            .findById(matchId)
            // .populate("FirstPlayerSide.PlayerId")
            // .populate("SecondPlayerSide.PlayerId")
            // .populate("InActionPlayerId")
            .then((match) => {

                const matchInfoDto: DTOs.IMatchDto = {
                    Id: match.id,
                    FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
                    SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
                    CreationDateTime: match.CreationDateTime,
                    Settings: {
                    } as DTOs.IMatchSettingsDto
                };
                responseData = new net.HttpMessage<DTOs.IMatchDto>(matchInfoDto);
                response
                    .status(httpStatusCodes.OK)
                    .json(matchInfoDto);
            })
            .catch((error: mongodb.MongoError) => {
                responseData = new net.HttpMessage<DTOs.IMatchDto>(null, error.message);
                response
                    .status(httpStatusCodes.NOT_FOUND)
                    .json(responseData);
            });
    }
);

router.post(
    "/:" + RoutingParamKeys.MatchId,
    jwtValidator,
    () => {
    }
);

export default router;