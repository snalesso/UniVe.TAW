import * as express from 'express';
import User from '../models/User';

class UsersRouter {

    public readonly router: express.Router;

    constructor() {
        this.router = express.Router();
        this.Routes();
    }

    public GetUsers(req: express.Request, res: express.Response) {

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

    public GetUser(req: express.Request, res: express.Response) {

        const userId = req.params["id"];

        res.json({ id: userId, username: "Daedalus" });
    }

    private Routes() {
        this.router.get('/', this.GetUsers);
        this.router.get('/:id', this.GetUser);
        // this.router.post('/', this.AddUser);
        // this.router.put('/:user', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    }

}

export default new UsersRouter().router;