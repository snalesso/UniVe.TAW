import * as express from 'express';
import * as mongoose from 'mongoose';
import * as Match from '../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../domain/models/mongodb/mongoose/PendingMatch';
import * as DTOs from '../DTOs/DTOs';
import * as httpStatusCodes from 'http-status-codes';
import * as net from '../../libs/unive.taw.framework/net';
import * as mongodb from 'mongodb';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import * as passport from 'passport';
import * as passportHTTP from 'passport-http';
import * as User from '../domain/models/mongodb/mongoose/User';
import 'colors';

let jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

const router: express.Router = express.Router();

router.post("/create", jwtValidator, (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let responseData: net.HttpMessage<string> = null;

    const challengerToken = req.body["challengerToken"];
    const mcr = req.body as DTOs.MatchCreationRequestDto;

    if (!mcr) {
        responseData = new net.HttpMessage<string>(null, "Invalid request");
        res
            .status(httpStatusCodes.FORBIDDEN)
            .json(responseData);
    } else {

        let newPendingMatch = PendingMatch.Create(mcr);
        PendingMatch.GetModel()
            .create(newPendingMatch)
            .then((data) => {
                const status = res.statusCode;
                res.json({ status, data });
            })
            .catch((error) => {
                const status = res.statusCode;
                res.json({ status, error });
            });
    }
});

router.get("/pending", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let responseData: net.HttpMessage<DTOs.PendingMatchDto[]> = null;

    PendingMatch.GetModel()
        .find()
        .then((matches) => {
            let matchDtos = matches.map((m) => new DTOs.PendingMatchDto(JSON.stringify(m.PlayerId)));
            responseData = new net.HttpMessage<DTOs.PendingMatchDto[]>(matchDtos);
            res
                .status(httpStatusCodes.OK)
                .json(matchDtos);
        })
        .catch((error: mongodb.MongoError) => {
            responseData = new net.HttpMessage<DTOs.PendingMatchDto[]>(null, error.message);
            res
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        });
});

router.post("/join/:pendingMatchId", (req: express.Request, res: express.Response, next: express.NextFunction) => {

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
                newMatchSkeleton.SecondPlayerId = new mongoose.Schema.Types.ObjectId(pmjr.PlayerId);
                let newMatch = Match.Create(newMatchSkeleton)
                newMatch
                    .save()
                    .then((createdMatch) => {
                        responseStatus = httpStatusCodes.CREATED;
                        const newMatchDto = new DTOs.MatchDto(
                            JSON.stringify(createdMatch._id),
                            JSON.stringify(createdMatch.FirstPlayerId),
                            JSON.stringify(createdMatch.SecondPlayerId),
                            createdMatch.CreationDateTime);
                        responseData = new net.HttpMessage<DTOs.MatchDto>(newMatchDto);
                    })
                    .catch((error: mongodb.MongoError) => {
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

router.get("/:matchId", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let responseData: net.HttpMessage<DTOs.PendingMatchDto> = null;

    const matchId = req.params["matchId"];

    PendingMatch.GetModel()
        .findById(matchId)
        .then((match) => {
            let matchDto = new DTOs.PendingMatchDto(JSON.stringify(match.PlayerId));
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

router.post("/:matchId", (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

export default router;