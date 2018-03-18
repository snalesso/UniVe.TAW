import * as express from 'express';
import User from '../models/User';
import * as mongoose from 'mongoose';
//import * as auth from '../../../libs/UniVe.TAW.Framework/auth';

class UsersRouter {

    public readonly router: express.Router;

    constructor() {
        this.router = express.Router();
        this.Routes();
    }

    public GetUsers(req: express.Request, res: express.Response) {

        User
            .find()
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

        User
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

    public AddUser(req: express.Request, res: express.Response) {

        const sr = req.body as unive.taw.framework.auth.SignupRequestDto;
        let newUser = new User({ Username: sr.Username, Password: sr.Password, BirthDate: sr.BirthDate, Country: sr.Country });

        newUser
            .save()
            .then((data) => {
                const status = res.statusCode;
                res.json({ status, data });
            })
            .catch((error) => {
                const status = res.statusCode;
                res.json({ status, error });
            });
    }

    public UpdateUser(req: express.Request, res: express.Response) {

        const sr = req.body as unive.taw.framework.auth.SignupRequestDto;
        let propsToUpdate = { Username: "sr.Username", Password: sr.Password, BirthDate: sr.BirthDate, Country: sr.Country };

        User
            .findByIdAndUpdate(req.params["id"], propsToUpdate)
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
        this.router.get('/', this.GetUsers);
        this.router.get('/:id', this.GetUser);
        this.router.post('/', this.AddUser);
        this.router.put('/:id', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    }

}

export default new UsersRouter().router;