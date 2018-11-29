import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';
import * as passport from 'passport';
import * as passportHTTP from 'passport-http';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import * as mongodb from 'mongodb';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as utils from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';

import * as DTOs from '../DTOs';
import RoutingParamKeys from './RoutingParamKeys';
import chalk from 'chalk';
import RoutesBase from './RoutesBase';
import * as cors from 'cors';

import * as moment from 'moment';

export default class GameRoutes extends RoutesBase {

    private readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());
        // this._router.use((req, res, next) => {
        //     res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
        //     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        //     if (req.method === 'OPTIONS') {
        //         res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        //         return res.status(httpStatusCodes.OK).json({});
        //     }
        //     next();
        // });

        passport.use(new passportHTTP.BasicStrategy(
            (username, password, done) => {
                console.log(chalk.yellow("Passport validating credentials ... "));

                const criteria = {} as utils.Mutable<User.IMongooseUser>;
                criteria.Username = username;
                User.getModel()
                    .findOne(criteria, (error, user: User.IMongooseUser) => {
                        if (error) {
                            return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: error });
                        }
                        if (!user) {
                            return done({ statusCode: httpStatusCodes.UNAUTHORIZED, error: true, errormessage: "Invalid user" });
                        }
                        if (user.validatePassword(password)) {
                            return done(null, user);
                        }
                        return done({ statusCode: http.STATUS_CODES.UNAUTHORIZED, error: true, errormessage: "Invalid password" });
                    });
            }
        ));

        // routes

        // TODO: check not already logged in
        this._router.post(
            '/login',
            passport.authenticate('basic', { session: false }),
            async (request: express.Request, response: express.Response) => {

                let user = request.user as User.IMongooseUser;

                let errMsg: string;
                let responseData: net.HttpMessage<string>;

                if (!user) {

                    console.log(chalk.red("Login failed!"));

                    responseData = new net.HttpMessage(null, "Invalid credentials");
                    response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                    return;
                }

                if (user.BannedUntil && user.BannedUntil < new Date()) {
                    user = await User.getModel().findById(user._id).exec();
                    user.BannedUntil = null;
                    user = await user.save();
                }

                if (user.BannedUntil) {
                    responseData = new net.HttpMessage(null, "You are banned until " + moment(user.BannedUntil).format("DD/MM/YYYY HH:mm:ss"));
                    response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                }
                else {
                    let jwtPayload: DTOs.IUserJWTData = {
                        Id: user._id.toHexString(),
                        Username: user.Username,
                        BannedUtil: user.BannedUntil
                    };
                    let token = jwt.sign(
                        jwtPayload,
                        process.env.JWT_KEY,
                        {
                            expiresIn: "7 days" // 60 * 60 * 24 * 7 // 1 week
                        });

                    console.log(chalk.green("Login SUCCESSFUL for ") + user.Username + " (id: " + user._id.toHexString() + ", token: " + token + ")");

                    responseData = new net.HttpMessage<string>(token);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

        // TODO: check logged in
        // TODO: prevent requests from same account on different devices or set up so that multiple devices receive updates
        this._router.post(
            '/logout',
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {
                const jwtUser = (request.user as DTOs.IUserJWTData);
                let responseData: net.HttpMessage<boolean>;

                if (!jwtUser) {
                    responseData = new net.HttpMessage<boolean>(false, "You need to be logged in to log out.");
                    response
                        .status(httpStatusCodes.BAD_REQUEST)
                        .json(responseData);
                } else {
                    responseData = new net.HttpMessage<boolean>(true);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

    }
}