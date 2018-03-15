import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as mongodb from 'mongodb';

import UsersRouter from './api/routers/usersRouter';

class ApiServer {

    public readonly Port: number;
    public readonly ExpressApp: express.Application;

    constructor(port: number = 1631) {
        this.Port = port;
        this.ExpressApp = express();
        this.DbConfig();
        this.ServerConfig();
    }

    private DbConfig() {

        mongoose.connect('mongodb://localhost:27017/univetaw');
        let db = mongoose.connection;
        db.on('error', (error) => {
            console.log("Mongoose connect error: " + JSON.stringify(error));
        });
        db.once('open', () => {
            console.log('Mongoose on-open: Siamo dentro!');
        });
    }

    private ServerConfig() {
        this.ExpressApp.use(bodyParser.urlencoded({ extended: true }));
        this.ExpressApp.use(bodyParser.json());
    }

    private Routes() {
        const router = express.Router();
        this.ExpressApp.use('/api', router);
        this.ExpressApp.use('/api/users', UsersRouter);
    }
}

export default new ApiServer().ExpressApp;