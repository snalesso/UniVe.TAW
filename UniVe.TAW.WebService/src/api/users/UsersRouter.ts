import * as express from 'express';
import * as User from '../models/User';
import * as mongoose from 'mongoose';
import * as auth from '../../libs/unive.taw.framework/auth';
import * as net from '../../libs/unive.taw.framework/net';

class UsersRouter {

    public readonly Router: express.Router;

    constructor() {
        this.Router = express.Router();
        this.Routes();
    }

    public GetUsers(req: express.Request, res: express.Response) {

        User.getModel()
            .find()
            .then((mongoUsers) => {
                let users: auth.UserDto[] = mongoUsers.map(mu => {
                    let id = JSON.stringify(mu._id);
                    let us = mu['Username'] as string;
                    let p = mu['Password'] as string;
                    let bds = mu['BirthDate'] as string;
                    let bd = new Date(bds);
                    let ci = mu['CountryId'] as number || 0;
                    let u = new auth.UserDto(id, us, p, bd, ci);
                    return u;
                });

                const status = res.statusCode;
                const hr = new net.HttpResponse<auth.UserDto[]>(users);
                res.json(hr);
            })
            .catch((error) => {
                const status = res.statusCode;
                res.json({ status, error });
            });
    }

    public GetUser(req: express.Request, res: express.Response) {

        const userId = req.params["id"];

        User.getModel()
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

        const sr = req.body as auth.SignupRequestDto;
        let newUser = User.createUser({ Username: sr.Username, Password: sr.Password, BirthDate: sr.BirthDate, CountryId: sr.CountryId });

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

        const sr = req.body as auth.SignupRequestDto;
        let propsToUpdate = { Username: "sr.Username", Password: sr.Password, BirthDate: sr.BirthDate, CountryId: sr.CountryId };

        User.getModel()
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
        this.Router.get('/', this.GetUsers);
        this.Router.get('/:id', this.GetUser);
        this.Router.post('/', this.AddUser);
        this.Router.put('/:id', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    }

}

export default new UsersRouter().Router;