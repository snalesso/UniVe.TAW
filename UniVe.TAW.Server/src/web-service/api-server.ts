import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as mongodb from 'mongodb';

import UsersRouter from './api/routers/UsersRouter';

export default class ApiServer {

    private readonly ExpressApp: express.Application;
    public readonly Port: number;

    constructor(port: number) {
        if (!port) throw new RangeError(port + " is not a valid port number");
        this.Port = port;
        this.ExpressApp = express();
        this.DbConfig();
        this.ServerConfig();
        this.Routes();
    }

    public Listen() {
        this.ExpressApp.listen(this.Port, () => console.log("ApiServer listening on port " + this.Port + "!"));
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
        this.ExpressApp.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1632');

            // // Request methods you wish to allow
            // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // // Request headers you wish to allow
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // // Set to true if you need the website to include cookies in the requests sent
            // // to the API (e.g. in case you use sessions)
            // res.setHeader('Access-Control-Allow-Credentials', "true");

            // Pass to next layer of middleware
            next();
        });
    }

    private Routes() {
        const router = express.Router();
        this.ExpressApp.use('/api', router);
        this.ExpressApp.use('/api/users', UsersRouter);
    }
}