import * as express from 'express';
import * as match from './Match';
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

        const userId = req.params["id"];

        Match.getModel()
            .findById(userId)
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