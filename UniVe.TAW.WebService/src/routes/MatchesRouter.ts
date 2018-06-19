import * as express from 'express';
import * as mongoose from 'mongoose';
import * as Match from '../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../domain/models/mongodb/mongoose/PendingMatch';
import * as DTOs from '../DTOs/DTOs';
import * as httpStatusCodes from 'http-status-codes';
import * as net from '../../libs/unive.taw.framework/net';
import * as mongodb from 'mongodb';

const router: express.Router = express.Router();

router.post("/create", (req: express.Request, res: express.Response, next: express.NextFunction) => {

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

router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

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

router.post("/:matchId", (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

export default router;