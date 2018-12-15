import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';
import * as passport from 'passport';
import * as passportHTTP from 'passport-http';
import * as jwt from 'jsonwebtoken';
import * as mongodb from 'mongodb';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as utils from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';

import * as DTOs from '../DTOs';
import chalk from 'chalk';
import RoutesBase from './RoutesBase';

import * as moment from 'moment';

export default class GameRoutes extends RoutesBase {

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        passport.use(new passportHTTP.BasicStrategy(
            (username, password, verifiedCallback: (error: net.IHttpResponseError, user?: User.IMongooseUser) => void) => {
                console.log(chalk.yellow("Passport validating credentials ..."));

                const criteria = { Username: username } as utils.Mutable<User.IMongooseUser>;

                User.getModel()
                    .findOne(criteria, (error: mongodb.MongoError, user: User.IMongooseUser) => {
                        if (error) {
                            return verifiedCallback({ Message: error.message, Status: httpStatusCodes.INTERNAL_SERVER_ERROR });
                        }
                        if (!user || !user.validatePassword(password)) {
                            return verifiedCallback({ Message: "Invalid credentials", Status: httpStatusCodes.UNAUTHORIZED });
                        }
                        return verifiedCallback(null, user);
                    });
            }
        ));

        // routes

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
                    return response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                }

                if (user.BannedUntil && user.BannedUntil < new Date()) {
                    user = await User.getModel().findById(user._id).exec();
                    user.BannedUntil = null;
                    user = await user.save();
                }

                if (user.BannedUntil) {
                    responseData = new net.HttpMessage(null, "You are banned until " + moment(user.BannedUntil).format("DD/MM/YYYY HH:mm:ss"));
                    return response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                }
                else {
                    let jwtPayload: DTOs.IUserJWTPayload = {
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

                    responseData = new net.HttpMessage(token);
                    return response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

        this._router.post(
            '/logout',
            this._jwtValidator,
            (request: express.Request, response: express.Response) => {

                const jwtUser = (request.user as DTOs.IUserJWTPayload);
                let responseData: net.HttpMessage<boolean>;

                if (!jwtUser) {
                    responseData = new net.HttpMessage(false, "You need to be logged in to log out.");
                    return response
                        .status(httpStatusCodes.BAD_REQUEST)
                        .json(responseData);
                } else {
                    responseData = new net.HttpMessage(true);
                    return response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

    }
}