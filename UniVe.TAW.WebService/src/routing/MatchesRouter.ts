import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as Match from '../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../domain/models/mongodb/mongoose/PendingMatch';
import * as DTOs from '../DTOs/DTOs';
import * as httpStatusCodes from 'http-status-codes';
import * as net from '../../libs/unive.taw.framework/net';
import * as mongodb from 'mongodb';
import * as expressJwt from 'express-jwt';
import 'colors';

const jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

const router: express.Router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const getUserPendingMatches = function (
    userId: mongoose.Types.ObjectId): Promise<PendingMatch.IMongoosePendingMatch> {

    const criteria = {} as PendingMatch.IMongoosePendingMatch;
    criteria.PlayerId = new mongoose.Types.ObjectId(userId);

    return PendingMatch
        .getModel()
        .findOne(criteria);
}

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

            getUserPendingMatches(jwtUserObjectId)
                .then((existingPendingMatch) => {

                    if (existingPendingMatch) {
                        responseData = new net.HttpMessage<string>(
                            existingPendingMatch.id,
                            "You already have a pending match!");
                        response
                            .status(httpStatusCodes.FORBIDDEN)
                            .json(responseData)
                    }
                    else {
                        const pendingMatchSkel = {} as PendingMatch.IMongoosePendingMatch;
                        pendingMatchSkel.PlayerId = jwtUserObjectId;
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
                .catch((error) => {
                    console.log("+++ Why are we here?".red);
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

                    console.log("Pending match identified".green);

                    const jwtUser = (request.user as DTOs.IUserJWTData);
                    const jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);

                    if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                        responseData = new net.HttpMessage<DTOs.MatchDto>(null, "You cannot join your own match! -.-\"");
                        response.status(httpStatusCodes.FORBIDDEN)
                            .json(responseData);

                    } else {
                        const newMatchSkeleton = {} as Match.IMongooseMatch;
                        newMatchSkeleton.FirstPlayerId = pendingMatch.PlayerId;
                        newMatchSkeleton.SecondPlayerId = jwtUserObjectId;

                        Match
                            .create(newMatchSkeleton)
                            .save()
                            .then((createdMatch) => {

                                console.log("New match created".green);

                                PendingMatch.getModel()
                                    .findByIdAndRemove(pendingMatch._id)
                                    .then((deletedPendingMatch) => {

                                        console.log("Pending match deleted".green);

                                        responseData = new net.HttpMessage<DTOs.MatchDto>(
                                            new DTOs.MatchDto(
                                                createdMatch.id,
                                                createdMatch.FirstPlayerId.toHexString(),
                                                createdMatch.SecondPlayerId.toHexString(),
                                                createdMatch.CreationDateTime));
                                        response
                                            .status(httpStatusCodes.CREATED)
                                            .json(responseData);
                                    })
                                    .catch((error: mongodb.MongoError) => {

                                        console.log("Shit happening: pending match found, new match created, pending match not deleted D:".red);

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
                    console.log("Could not find requested pending match".red);
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
                    match.FirstPlayerId.toHexString(),
                    match.SecondPlayerId.toHexString(),
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