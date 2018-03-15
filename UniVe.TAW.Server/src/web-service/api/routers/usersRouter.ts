import * as express from 'express';
import User from '../models/User';

class UsersRouter {

    public readonly router: express.Router;

    constructor() {
        this.router = express.Router();
        this.routes();
    }

    public GetUser(req: express.Request, res: express.Response) {
        User
            .find({})
            .then((data) => {
                const status = res.statusCode;
                res.json({ status, data });
            })
            .catch((error) => {
                const status = res.statusCode;
                res.json({ status, error });
            });
    }

    private routes() {
        this.router.get('/users', this.GetUser);
    }

}

export default new UsersRouter().router;