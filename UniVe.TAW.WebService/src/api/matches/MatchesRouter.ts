import * as express from 'express';
import * as Match from './Match';
import * as mongoose from 'mongoose';
import * as auth from '../../libs/unive.taw.framework/auth';
import * as net from '../../libs/unive.taw.framework/net';

class MatchesRouter {

    public readonly Router: express.Router;

    constructor() {
        this.Router = express.Router();
        this.Routes();
    }

    public CreateMatch(req: express.Request, res: express.Response) {

        const challengerToken = req.params["challengerToken"];

        let newMatch = Match.create({});
        Match.getModel()
            .findById(matchId)
            .then((data) => {
                const status = res.statusCode;
                res.json({ status, data });
            })
            .catch((error) => {
                const status = res.statusCode;
                res.json({ status, error });
            });
    }

    private Routes() {
        this.Router.post('/', this.CreateMatch);
        //this.Router.put('/:id', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    }

}

export default new MatchesRouter().Router;