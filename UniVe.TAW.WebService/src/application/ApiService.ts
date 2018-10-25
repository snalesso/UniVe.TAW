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

// TODO: rename into WebService?
// TODO: use cors()
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

                    // console.log("deleting all pending matches ...");

                    // PendingMatch.getModel().find().then(pms => {

                    //     for (let pm of pms) {
                    //         pm.remove();
                    //         console.log("deleted PM (id: " + pm._id.toHexString() + ")");
                    //     }
                    // }).catch(error => { console.log("error deleting pending match") });

                    // console.log("all pending matches deleted");
                    // console.log("deleting all matches ...");

                    // Match.getModel().find().then(matches => {

                    //     for (let m of matches) {
                    //         m.remove();
                    //         console.log("deleted M (id: " + m._id.toHexString() + ")");
                    //     }
                    // }).catch(error => { console.log("error deleting match") });

                    // console.log("all matches deleted");

                    // User.getModel().find().then(users => {
                    //     try {
                    //         for (let u of users) {
                    //             if (u.SentMessages) {
                    //                 u.SentMessages.clear();
                    //                 u.markModified("SentMessages");
                    //                 u.save();
                    //             }
                    //         }
                    //     }
                    //     catch (ex) {
                    //         console.log(ex);
                    //     }
                    // })

                    this.ConfigRoutes();
                    this.ConfigMiddlewares();

                    this._socketIOServer.on(
                        "connection",
                        (clientSocket) => {
                            clientSocket.emit(ServiceEventKeys.WhoAreYou, (response) => { });

                            clientSocket.emit("ciao", { data: 3232 });
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

        this._expressApp.get(
            '/diocane',
            (request: express.Request, response: express.Response) => {
                response
                    .status(httpStatusCodes.OK)
                    .json("diocane");
            });

        this._expressApp.use('/users', this._usersRoutes.Router);
        this._expressApp.use('/auth', this._authRoutes.Router);
        this._expressApp.use('/matches', this._gameRoutes.Router); // TODO: rename to /game?
        this._expressApp.use('/chat', this._chatRoutes.Router);
    }
}