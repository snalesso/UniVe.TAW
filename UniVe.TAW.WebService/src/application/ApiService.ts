﻿import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as expressJwt from 'express-jwt';
import * as socketio from 'socket.io';
import chalk from 'chalk';

import AuthRoutes from './routing/AuthRoutes';
import UsersRoutes from './routing/UsersRoutes';
import GameRoutes from './routing/GameRoutes';

import * as net from '../infrastructure/net';

// TODO: rename into WebService?
export default class ApiService {

    private readonly _dbUrl = 'mongodb://localhost:27017/univetaw';
    private readonly _expressApp: express.Application;
    private readonly _httpServer: http.Server;
    private readonly _socketIoServer: socketio.Server;

    private readonly _usersRoutes: UsersRoutes;
    private readonly _authRoutes: AuthRoutes;
    private readonly _gameRoutes: GameRoutes;

    public readonly Port: number;

    constructor(port: number) {

        if (!port) throw new RangeError(port + ' is not a valid port number');

        this.Port = port;
        this._expressApp = express();
        this._httpServer = http.createServer(this._expressApp);
        this._socketIoServer = socketio(this._httpServer);

        this._usersRoutes = new UsersRoutes(this._socketIoServer);
        this._authRoutes = new AuthRoutes(this._socketIoServer);
        this._gameRoutes = new GameRoutes(this._socketIoServer);
    }

    public Start() {

        // TODO: get rid of magic string
        console.log("ApiService starting ...");

        // mongoose.connection.on("connected", () => {
        //     console.log("mongoose connected");
        // });
        // mongoose.connection.on("error", (error: mongodb.MongoError) => {
        //     console.log("mongoose connection error: ".red + error.message);
        // });
        mongoose.connection.on("disconnected", (a) => {
            console.log("mongoose disconnected");
        });
        mongoose.connection.on("SIGINT", (a) => {
            console.log("Recived SIGINT");
            mongoose.connection.close(() => {
                console.log('mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });

        mongoose
            .connect(this._dbUrl, { useNewUrlParser: true })
            .then(
                () => {
                    console.log(chalk.green("mongoose connected to " + this._dbUrl));

                    this.ConfigRoutes();
                    this.ConfigMiddlewares();

                    this._httpServer.listen(
                        this.Port,
                        () => console.log(chalk.green("HTTP Server listening @ http://localhost:" + this.Port)));
                },
                (error: mongodb.MongoError) => {
                    console.log(chalk.red("mongoose connection failed! Reason: ") + error.message);
                });
    }

    private ConfigMiddlewares() {
        console.log("Configuring middlewares ...");

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
        // handles express-jwt invalid tokens
        this._expressApp.use((error: expressJwt.UnauthorizedError, request: express.Request, response: express.Response, next: express.NextFunction) => {
            console.log(chalk.red("UnauthorizedError (JWT): ") + JSON.stringify(error.message));
            response
                .status(httpStatusCodes.UNAUTHORIZED)
                .json(new net.HttpMessage<string>(null, error.message));
        });
        // handles unhandled errors
        this._expressApp.use(function (err, req, res, next) {
            console.log(chalk.red("Request error: ") + JSON.stringify(err));
            res.status(err.statusCode || 500).json(err);

        });
        // handle request that point to invalid endpoints
        // this._expressApp.use((req, res, next) => {
        //     res.status(404).json({ statusCode: 404, error: true, errormessage: "Invalid endpoint " + req.url });
        // });
    }

    private ConfigRoutes() {
        console.log("Configuring routes ...");

        this._expressApp.use('/users', this._usersRoutes.Router);
        this._expressApp.use('/auth', this._authRoutes.Router);
        this._expressApp.use('/matches', this._gameRoutes.Router); // TODO: rename to /game?
    }
}