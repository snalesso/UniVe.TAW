import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as expressJwt from 'express-jwt';

import * as net from '../../infrastructure/net';
import * as utils from '../../infrastructure/utils';

import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';

import * as DTOs from '../../application/DTOs';
import chalk from 'chalk';

const jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

const router: express.Router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const getUserPendingMatches = (userId: mongoose.Types.ObjectId): Promise<PendingMatch.IMongoosePendingMatch> => {

    const criteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
    criteria.PlayerId = new mongoose.Types.ObjectId(userId);

    return PendingMatch
        .getModel()
        .findOne(criteria);
};

router.post(
    "/create",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        if (!request.user) {
            response
                .status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
        }
        else {
            let responseData: net.HttpMessage<string> = null;

            const jwtUser = (request.user as DTOs.IUserJWTData);
            const jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);

            const pendingMatchCriteria = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
            pendingMatchCriteria.PlayerId = jwtUserObjectId;

            return PendingMatch
                .getModel()
                // ensure the user has no pending matches opened
                .findOne(pendingMatchCriteria)
                .then((existingPendingMatch) => {

                    if (existingPendingMatch) {
                        responseData = new net.HttpMessage<string>(
                            existingPendingMatch.id,
                            "You already have a pending match!");
                        response
                            .status(httpStatusCodes.FORBIDDEN)
                            .json(responseData);
                    }
                    else {

                        // ensure the user isn't already playing

                        const matchCriteria1 = {} as utils.Mutable<Match.IMongooseMatch>;
                        (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                        (matchCriteria1.FirstPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = pendingMatchCriteria.PlayerId;

                        const matchCriteria2 = {} as utils.Mutable<Match.IMongooseMatch>;
                        (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>) = {} as utils.Mutable<PendingMatch.IMongoosePendingMatch>;
                        (matchCriteria2.SecondPlayerSide as utils.Mutable<PendingMatch.IMongoosePendingMatch>).PlayerId = pendingMatchCriteria.PlayerId;

                        Match.getModel()
                            .findOne({ $or: [matchCriteria1, matchCriteria2] })
                            .then((existingMatch) => {

                                // if the user is already playing
                                if (existingMatch) {
                                    responseData = new net.HttpMessage<string>(
                                        existingMatch.id,
                                        "You are already playing!");
                                    response
                                        .status(httpStatusCodes.FORBIDDEN)
                                        .json(responseData);
                                }
                                else {
                                    // if the user has no pending matches nor matches
                                    const pendingMatchSkel = pendingMatchCriteria;
                                    const newPendingMatch = PendingMatch.create(pendingMatchSkel);

                                    PendingMatch
                                        .getModel()
                                        .create(newPendingMatch)
                                        .then((newPendingMatch) => {
                                            responseData = new net.HttpMessage<string>(newPendingMatch.id);
                                            response
                                                .status(httpStatusCodes.CREATED)
                                                .json(responseData);
                                        })
                                        .catch((error: mongodb.MongoError) => {
                                            responseData = new net.HttpMessage<string>(null, error.message);
                                            response
                                                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                                .json(responseData);
                                        });
                                }
                            })
                            .catch(); // TODO: handle
                    }
                })
                .catch((error) => {
                    console.log(chalk.red("+++ Why are we here?"));
                    responseData = new net.HttpMessage<string>(null, "Could not verify pending matches");
                    response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                });
        }
    });

router.get(
    "/pending",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.PendingMatchDto[]> = null;

        PendingMatch.getModel()
            .find()
            .then((matches) => {
                let matchDtos = matches.map((m) => new DTOs.PendingMatchDto(
                    m.id,
                    m.PlayerId.toHexString()));
                responseData = new net.HttpMessage<DTOs.PendingMatchDto[]>(matchDtos);
                response
                    .status(httpStatusCodes.OK)
                    .json(matchDtos);
            })
            .catch((error: mongodb.MongoError) => {
                responseData = new net.HttpMessage<DTOs.PendingMatchDto[]>(null, error.message);
                response
                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                    .json(responseData);
            });
    });

const pendingMatchIdKey = "pendingMatchId";
router.post(
    "/join/:" + pendingMatchIdKey,
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.MatchDto> = null;

        const pendingMatchId = request.params[pendingMatchIdKey];

        if (!pendingMatchId) {
            responseData = new net.HttpMessage<DTOs.MatchDto>(null, "Unable to find requested match");
            response
                .status(httpStatusCodes.BAD_REQUEST)
                .json(responseData);
        }
        else {
            PendingMatch.getModel()
                .findById(pendingMatchId)
                .then((pendingMatch) => {

                    console.log(chalk.green("Pending match identified"));

                    const jwtUser = (request.user as DTOs.IUserJWTData);
                    const jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);

                    // ensure the pending match is not joined by the same player who created it
                    if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                        responseData = new net.HttpMessage<DTOs.MatchDto>(null, "You cannot join your own match! -.-\"");
                        response.status(httpStatusCodes.FORBIDDEN)
                            .json(responseData);

                    } else {
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

                                        responseData = new net.HttpMessage<DTOs.MatchDto>(
                                            new DTOs.MatchDto(
                                                createdMatch.id,
                                                createdMatch.FirstPlayerSide.PlayerId.toHexString(),
                                                createdMatch.SecondPlayerSide.PlayerId.toHexString(),
                                                createdMatch.CreationDateTime));
                                        response
                                            .status(httpStatusCodes.CREATED)
                                            .json(responseData);
                                    })
                                    .catch((error: mongodb.MongoError) => {

                                        console.log(chalk.red("Shit happening: pending match found, new match created, pending match not deleted D:"));

                                        responseData = new net.HttpMessage<DTOs.MatchDto>(
                                            null,
                                            "Unable to delete pendingMatch after creating the real match. Reason: " + error.message);
                                        response
                                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                            .json(responseData);
                                    });
                            })
                            .catch((error: mongodb.MongoError) => {
                                responseData = new net.HttpMessage<DTOs.MatchDto>(null, error.message);
                                response
                                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                    .json(responseData);
                            });
                    }
                })
                .catch((error: mongodb.MongoError) => {
                    console.log(chalk.red("Could not find requested pending match"));
                    responseData = new net.HttpMessage<DTOs.MatchDto>(
                        null,
                        "Unable to find requested pending match. Reason: " + error.message);
                    response
                        .status(httpStatusCodes.NOT_FOUND)
                        .json(responseData);
                });
        }
    });

const matchIdKey = "matchId";
router.get(
    "/:" + matchIdKey,
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.MatchDto> = null;

        const matchId = request.params[matchIdKey];

        Match.getModel()
            .findById(matchId)
            .then((match) => {
                const matchDto = new DTOs.MatchDto(
                    match.id,
                    match.FirstPlayerSide.PlayerId.toHexString(),
                    match.SecondPlayerSide.PlayerId.toHexString(),
                    match.CreationDateTime);
                responseData = new net.HttpMessage<DTOs.MatchDto>(matchDto);
                response
                    .status(httpStatusCodes.OK)
                    .json(matchDto);
            })
            .catch((error: mongodb.MongoError) => {
                responseData = new net.HttpMessage<DTOs.MatchDto>(null, error.message);
                response
                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR) // TODO: INTERNAL_SERVER_ERROR or NOT_FOUND?
                    .json(responseData);
            });
    });

router.post(
    "/:" + matchIdKey,
    () => {
    });

export default router;