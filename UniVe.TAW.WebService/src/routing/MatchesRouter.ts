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

router.post(
    "/create",
    jwtValidator,
    (request: express.Request, response: express.Response) => {

        if (!request.user) {
            response
                .status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
        }
        else {
            let responseData: net.HttpMessage<DTOs.PendingMatchDto> = null;

            const jwtUser = (request.user as DTOs.IUserJWTData);

            let criteria = {} as PendingMatch.IMongoosePendingMatch;
            criteria.PlayerId = new mongoose.Types.ObjectId(jwtUser.Id);

            PendingMatch
                .GetModel()
                .findOne(criteria)
                .then((existingPendingMatch) => {

                    if (existingPendingMatch) {
                        responseData = new net.HttpMessage<DTOs.PendingMatchDto>(
                            new DTOs.PendingMatchDto(
                                existingPendingMatch.id,
                                existingPendingMatch.PlayerId.toHexString()),
                            "You already have a pending match!");
                        response
                            .status(httpStatusCodes.FORBIDDEN)
                            .json(responseData)
                    }
                    else {
                        const pendingMatchSkel = criteria;
                        let newPendingMatch = PendingMatch.Create(pendingMatchSkel);

                        PendingMatch
                            .GetModel()
                            .create(newPendingMatch)
                            .then((newPendingMatch) => {
                                responseData = new net.HttpMessage<DTOs.PendingMatchDto>(
                                    new DTOs.PendingMatchDto(
                                        newPendingMatch.id,
                                        newPendingMatch.PlayerId.toHexString()));
                                response
                                    .status(httpStatusCodes.CREATED)
                                    .json(responseData);
                            })
                            .catch((error: mongodb.MongoError) => {
                                responseData = new net.HttpMessage<DTOs.PendingMatchDto>(null, error.message);
                                response
                                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                    .json(responseData);
                            });
                    }
                })
                .catch((error) => {
                    console.log("+++ Why are we here?".red);
                    responseData = new net.HttpMessage<DTOs.PendingMatchDto>(null, "Could not verify pending matches");
                    response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                });
        }
    });

router.get(
    "/pending",
    (request: express.Request, response: express.Response) => {

        let responseData: net.HttpMessage<DTOs.PendingMatchDto[]> = null;

        PendingMatch.GetModel()
            .find()
            .then((matches) => {
                let matchDtos = matches.map((m) => new DTOs.PendingMatchDto(
                    JSON.stringify(m.id),
                    JSON.stringify(m.PlayerId)));
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

router.post("/join/:pendingMatchId", (req: express.Request, res: express.Response) => {

    let responseData: net.HttpMessage<DTOs.MatchDto> = null;

    const pendingMatchId = req.params["pendingMatchId"];
    const pmjr = req.body as DTOs.JoinPendingMatchRequestDto;

    if (!pmjr) {
        // TODO: handle
    }
    else {
        PendingMatch.GetModel()
            .findByIdAndRemove(pendingMatchId)
            .then((pendingMatch) => {

                let responseStatus: number;

                let newMatchSkeleton = {} as Match.IMongooseMatch;
                newMatchSkeleton.FirstPlayerId = pendingMatch.PlayerId;
                newMatchSkeleton.SecondPlayerId = new mongoose.Types.ObjectId(pmjr.PlayerId);
                let newMatch = Match.Create(newMatchSkeleton)
                newMatch
                    .save()
                    .then((createdMatch) => {
                        responseStatus = httpStatusCodes.CREATED;
                        const newMatchDto = new DTOs.MatchDto(
                            JSON.stringify(createdMatch.id),
                            JSON.stringify(createdMatch.FirstPlayerId),
                            JSON.stringify(createdMatch.SecondPlayerId),
                            createdMatch.CreationDateTime);
                        responseData = new net.HttpMessage<DTOs.MatchDto>(newMatchDto);
                    })
                    .catch(() => {
                        responseStatus = httpStatusCodes.INTERNAL_SERVER_ERROR;
                    });

                res
                    .status(responseStatus)
                    .json(responseData);
            })
            .catch((error: mongodb.MongoError) => {
                responseData = new net.HttpMessage<DTOs.MatchDto>(
                    null,
                    "Unable to reach pending match. Reason: " + error.message);
                res
                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                    .json(responseData);
            });
    }
});

router.get("/:matchId", (req: express.Request, res: express.Response) => {

    let responseData: net.HttpMessage<DTOs.PendingMatchDto> = null;

    const matchId = req.params["matchId"];

    PendingMatch.GetModel()
        .findById(matchId)
        .then((match) => {
            let matchDto = new DTOs.PendingMatchDto(JSON.stringify(match.id), JSON.stringify(match.PlayerId));
            responseData = new net.HttpMessage<DTOs.PendingMatchDto>(matchDto);
            res
                .status(httpStatusCodes.OK)
                .json(matchDto);
        })
        .catch((error: mongodb.MongoError) => {
            responseData = new net.HttpMessage<DTOs.PendingMatchDto>(null, error.message);
            res
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        });
});

router.post("/:matchId", () => {

});

export default router;