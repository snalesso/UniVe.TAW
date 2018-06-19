import * as express from 'express';
import * as mongoose from 'mongoose';
import * as auth from '../../libs/unive.taw.framework/auth';
import * as net from '../../libs/unive.taw.framework/net';
import * as Match from '../domain/models/mongodb/mongoose/Match';

const router: express.Router = express.Router();

router.post("/create", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const challengerToken = req.params["challengerToken"];

    let newMatch = Match.Create({});
    Match.GetModel()
        .create(newMatch)
        .then((data) => {
            const status = res.statusCode;
            res.json({ status, data });
        })
        .catch((error) => {
            const status = res.statusCode;
            res.json({ status, error });
        });
});

router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

router.post("/:matchId/attack", (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

export default router;