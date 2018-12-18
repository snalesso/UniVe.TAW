import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as expressJwt from 'express-jwt';
import * as socketIO from 'socket.io';
import chalk from 'chalk';
import * as cors from 'cors';

import AuthRoutes from './routing/AuthRoutes';
import UsersRoutes from './routing/UsersRoutes';
import GameRoutes from './routing/GameRoutes';
import ChatRoutes from './routing/ChatRoutes';

import * as User from '../domain/models/mongodb/mongoose/User';
import * as Match from '../domain/models/mongodb/mongoose/Match';
import * as PendingMatch from '../domain/models/mongodb/mongoose/PendingMatch';

import * as net from '../infrastructure/net';
import * as utils from '../infrastructure/utils';

import ServiceEventKeys from './services/ServiceEventKeys';
import DBUtils from './services/DBUtils';
import passport = require('passport');
import * as jwt from 'jsonwebtoken';

export default class ApiService {

    private readonly _dbUrl = 'mongodb://localhost:27017/univetaw';

    private readonly _expressApp: express.Application;
    private readonly _httpServer: http.Server;
    private readonly _socketIOServer: socketIO.Server;

    private readonly _usersRoutes: UsersRoutes;
    private readonly _authRoutes: AuthRoutes;
    private readonly _gameRoutes: GameRoutes;
    private readonly _chatRoutes: ChatRoutes;

    private readonly _socketIoConnections: socketIO.Rooms;

    public readonly Port: number;

    constructor(port: number) {

        if (!port) throw new RangeError(port + ' is not a valid port number');

        this.Port = port;
        this._expressApp = express();
        this._httpServer = http.createServer(this._expressApp);
        this._socketIOServer = socketIO(this._httpServer);

        this._usersRoutes = new UsersRoutes(this._socketIOServer);
        this._authRoutes = new AuthRoutes(this._socketIOServer);
        this._gameRoutes = new GameRoutes(this._socketIOServer);
        this._chatRoutes = new ChatRoutes(this._socketIOServer);
    }

    public async Start() {

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
                async () => {
                    console.log(chalk.green("mongoose connected to " + this._dbUrl));

                    // await DBUtils.deleteEverything();

                    // await DBUtils.generateFakeData(
                    //     [
                    //         // admin
                    //         "Daedalus",
                    //         // mods
                    //         "Horus",
                    //         "Osiride",
                    //         "Anubi",
                    //         // players
                    //         "Pippo",
                    //         "Pluto",
                    //         "Puffetta",
                    //         "Paperino",
                    //         "Minnie",
                    //         "Topolino",
                    //         "Bambee",
                    //         "Cenerentola",
                    //         // bannable
                    //         "TrollKing",
                    //         "Furfante",
                    //         "Canaglia",
                    //         "Farabutto"
                    //     ],
                    //     300,
                    //     false);

                    this.ConfigRoutes();
                    this.ConfigMiddlewares();

                    this._socketIOServer.on(
                        "connection",
                        (clientSocket) => {
                            console.log("Socket.io connection from " + clientSocket.id);
                            clientSocket.on("disconnect", (data) => console.log("Socket.io disconnection from " + clientSocket.id));
                        });

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
        this._expressApp.use(cors());

        this._expressApp.use((error: expressJwt.UnauthorizedError | net.IHttpResponseError, request: express.Request, response: express.Response, next: express.NextFunction) => {

            if (error instanceof expressJwt.UnauthorizedError) {
                console.log(chalk.red("expressJwt.UnauthorizedError error: ") + error.message);
                return response
                    .status(error.status)
                    .json(new net.HttpMessage(null, error.message));
            }
            else {
                console.log(chalk.red("IHttpResponseError: ") + error.Message);
                return response
                    .status(error.Status)
                    .json(new net.HttpMessage(null, error.Message));
            }
        });
    }

    private ConfigRoutes() {
        console.log("Configuring routes ...");

        this._expressApp.use('/users', this._usersRoutes.Router);
        this._expressApp.use('/auth', this._authRoutes.Router);
        this._expressApp.use('/game', this._gameRoutes.Router);
        this._expressApp.use('/chat', this._chatRoutes.Router);
    }
}