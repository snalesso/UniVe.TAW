import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
//import * as mongodb from 'mongodb';
import * as httpStatusCodes from 'http-status-codes';

import UsersRouter from './routes/UsersRouter';
import MatchesRouter from './routes/MatchesRouter';

export default class ApiService {

    private readonly _dbUrl = 'mongodb://localhost:27017/univetaw';
    private readonly _expressApp: express.Application;

    public readonly Port: number;

    constructor(port: number) {
        if (!port) throw new RangeError(port + ' is not a valid port number');
        this.Port = port;
        this._expressApp = express();
        this.ConfigRoutes();
        //this.DbConfig();
        //this.ServerConfig();
    }

    public Start() {

        console.log("Server starting!")

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
            .then(
                () => this.ServerConfig(),
                (reason: any) => console.log("Error during serverconfig: " + reason))
            //.catch(reason => console.log("Catch del server config " + reason))
            .then(
                () => {
                    this._expressApp.listen(this.Port, () => console.log('ApiServer listening on http://localhost:' + this.Port + '!'));
                    //throw new Error("error thrown manually alongside express.listen");
                },
                (reason: any) => console.log("Error during expressapp listen: " + reason))
            //.then(() => this.ExpressApp.listen(this.Port, () => console.log('ApiServer listening on port ' + this.Port + '!')))
            ;
    }

    // private DbConfig() {

    //     // let db = mongoose.connection;
    //     // db.on('error', (error) => {
    //     //     console.log('Mongoose couldn\'t connect to ' + this.DbUrl + ' error: ' + JSON.stringify(error));
    //     // });
    //     // db.once('open', () => {
    //     //     console.log('Mongoose connected (once("open")) to ' + this.DbUrl);
    //     // });
    // }

    private ServerConfig() {
        this._expressApp.use(bodyParser.urlencoded({ extended: true }));
        this._expressApp.use(bodyParser.json());
        this._expressApp.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
                return res.status(httpStatusCodes.OK).json({});
            }
            next();
        });
        // // handle unresolved requests (404)
        // this._expressApp.use((req, res, next) => {
        //     res.status(404).json({ error: true, errormessage: "Invalid endpoint" });
        // });

        //throw new Error("fefakwpoefkaew");
    }

    private ConfigRoutes() {
        // const router = express.Router();
        // this._expressApp.use('/api', router);
        this._expressApp.use('/users', UsersRouter);
        this._expressApp.use('/matches', MatchesRouter);
    }
}