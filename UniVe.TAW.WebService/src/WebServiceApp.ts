import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
//import * as mongodb from 'mongodb';

import UsersRouter from './api/routers/UsersRouter';

export default class ApiServer {

    private readonly _dbUrl = 'mongodb://localhost:27017/univetaw';
    private readonly _expressApp: express.Application;
    public readonly Port: number;

    constructor(port: number) {
        if (!port) throw new RangeError(port + ' is not a valid port number');
        this.Port = port;
        this._expressApp = express();
        this.DbConfig();
        this.ServerConfig();
        this.Routes();
    }

    public Start() {
        mongoose
            .connect(
                this._dbUrl
                //,undefined
                //,(error: mongodb.MongoError) => console.log("mongoose connection failed (.connect().catch)! Error: " + error.message)
            )
            //() => console.log("mongoose connected! (.connect().then)")
            //.catch((error: mongodb.MongoError) => console.log("mongoose connection failed (.connect().catch)! Error: " + error.message))
            .then(
                (dbConnection: mongoose.Mongoose) => console.log("Mongoose connected! (.connect().then(fullfilled))"),
                (error: mongodb.MongoError) => console.log("Mongoose connection failed (.connect().then(rejected))! Error: " + error.message))
            .then(() => this._expressApp.listen(this.Port, () => console.log('ApiServer listening on port ' + this.Port + '!')))
            //.then(() => this.ExpressApp.listen(this.Port, () => console.log('ApiServer listening on port ' + this.Port + '!')))
            ;
    }

    private DbConfig() {

        // let db = mongoose.connection;
        // db.on('error', (error) => {
        //     console.log('Mongoose couldn\'t connect to ' + this.DbUrl + ' error: ' + JSON.stringify(error));
        // });
        // db.once('open', () => {
        //     console.log('Mongoose connected (once("open")) to ' + this.DbUrl);
        // });
    }

    private ServerConfig() {
        this._expressApp.use(bodyParser.urlencoded({ extended: true }));
        this._expressApp.use(bodyParser.json());
        this._expressApp.use((req, res, next) => {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + this.Port);

            // // Request methods you wish to allow
            // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // // Request headers you wish to allow
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // // Set to true if you need the website to include cookies in the requests sent
            // // to the API (e.g. in case you use sessions)
            // res.setHeader('Access-Control-Allow-Credentials', 'true');

            // Pass to next layer of middleware
            next();
        });
    }

    private Routes() {
        const router = express.Router();
        this._expressApp.use('/api', router);
        this._expressApp.use('/api/users', UsersRouter);
    }
}