import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import * as expressJwt from 'express-jwt';
import * as socketio from 'socket.io';

import * as net from '../../infrastructure/net';
import * as identity from '../../infrastructure/identity';
import * as utils from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';
import * as EndedMatch from '../../domain/models/mongodb/mongoose/EndedMatch';

import * as DTOs from '../DTOs';
import RoutingParamKeys from './RoutingParamKeys';
import * as moment from 'moment'
import RoutesBase from './RoutesBase';
import * as cors from 'cors';

export default class UsersRoutes extends RoutesBase {

    private readonly _jwtValidator: expressJwt.RequestHandler;

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });

        this._router.use(bodyParser.urlencoded({ extended: true }));
        this._router.use(bodyParser.json());
        this._router.use(cors());

        this._router.post(
            '/signup',
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<boolean>;

                const signupReq = request.body as DTOs.ISignupRequestDto;

                // TODO: test all branches
                if (!signupReq) {
                    response.status(httpStatusCodes.FORBIDDEN);
                } else {
                    //let feawfw = signupReq as User.IMongoUser;
                    let newUserSkel = {} as utils.Mutable<User.IMongooseUser>;
                    newUserSkel.Username = signupReq.Username.trim();
                    newUserSkel.CountryId = signupReq.CountryId;
                    newUserSkel.BirthDate = signupReq.BirthDate;
                    newUserSkel.Roles = identity.UserRoles.Player;

                    let newUser = User.create(newUserSkel);
                    newUser.setPassword(signupReq.Password);
                    newUser.save()
                        .then(result => {
                            console.log("user created: " + JSON.stringify(result));
                            responseData = new net.HttpMessage<boolean>(true);
                            response
                                .status(httpStatusCodes.CREATED)
                                .json(responseData);
                        })
                        .catch((error: mongodb.MongoError) => {
                            console.log("user creation failed: " + JSON.stringify(error));

                            const aeuCriteria = {} as utils.Mutable<User.IMongooseUser>;
                            aeuCriteria.Username = newUser.Username;
                            User.getModel()
                                .findOne(aeuCriteria)
                                .then((takenUser) => {

                                    let errMsg: string;
                                    let statusCode: number;
                                    switch (error.code) {
                                        case 11000:
                                            errMsg = "Username taken";
                                            statusCode = httpStatusCodes.CONFLICT;
                                            break;
                                        default:
                                            errMsg = "Uknown error";
                                            statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                                            break;
                                    }
                                    responseData = new net.HttpMessage<boolean>(false, errMsg);
                                    response
                                        .status(statusCode)
                                        .json(responseData);
                                });
                        });
                }
            });

        // this._router.get(
        //     '/cazzo',
        //     this._jwtValidator,
        //     (request: express.Request, response: express.Response, next: express.NextFunction) => {
        //         const userJWTData = (request.user as DTOs.IUserJWTData);
        //         response.json("diocane " + userJWTData.Username);
        //     });

        // TODO: add authentication and allow delete only to same user
        // this._router.delete(
        //     "/:" + RoutingParamKeys.userId,
        //     this._jwtValidator,
        //     (request: express.Request, response: express.Response, next: express.NextFunction) => {

        //         const userId = request.params[RoutingParamKeys.userId];
        //         let responseData: net.HttpMessage<boolean> = null;

        //         User.getModel()
        //             .findByIdAndRemove(
        //                 userId,
        //                 (error: mongodb.MongoError, deletedUser) => {
        //                     if (error) {
        //                         responseData = new net.HttpMessage<boolean>(null, error.message);
        //                         response
        //                             .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
        //                             .json(responseData);
        //                     }
        //                     else if (!deletedUser) {
        //                         responseData = new net.HttpMessage<boolean>(null, "User not found!");
        //                         response
        //                             .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
        //                             .json(responseData);
        //                     }
        //                     else {
        //                         responseData = new net.HttpMessage<boolean>(true);
        //                         response
        //                             .status(httpStatusCodes.OK)
        //                             .json(responseData);
        //                     }
        //                 });
        //     });

        this._router.get(
            "/profile/:" + RoutingParamKeys.userId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userHexId = request.params[RoutingParamKeys.userId];
                const userObjectId = new mongoose.Types.ObjectId(userHexId);
                let responseData: net.HttpMessage<DTOs.IUserProfile> = null;

                User.getModel()
                    .findById(userHexId)
                    .then((mongoUser) => {

                        EndedMatch.getModel()
                            .find({ $or: [{ "FirstPlayerSide.PlayerId": userHexId }, { "SecondPlayerSide.PlayerId": userHexId }] })
                            .then(userEndedMatches => {

                                let profileDto: DTOs.IUserProfile = {
                                    Id: mongoUser.id,
                                    Username: mongoUser.Username,
                                    Age: moment().diff(mongoUser.BirthDate, "years", false),
                                    CountryId: mongoUser.CountryId,
                                    WinsCount: (userEndedMatches && userEndedMatches.length > 0) ? userEndedMatches.filter(em => em.WinnerId.equals(userObjectId)).length : 0,
                                    LossesCount: (userEndedMatches && userEndedMatches.length > 0) ? userEndedMatches.filter(em => !em.WinnerId.equals(userObjectId)).length : 0
                                };

                                responseData = new net.HttpMessage<DTOs.IUserProfile>(profileDto);
                                response
                                    .status(httpStatusCodes.OK)
                                    .json(responseData);
                            });
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage<DTOs.IUserProfile>(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
            });

        this._router.get(
            '/rankings',//:' + RoutingParamKeys.userId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userJWTData = (request.user as DTOs.IUserJWTData);
                //const userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
                let responseData: net.HttpMessage<DTOs.IUserRanking[]> = null;

                Promise
                    .all([
                        User.getModel().find().exec(),
                        EndedMatch.getModel().find().exec()
                    ])
                    .then(queries => {
                        const [users, endedMatches] = queries;

                        let rankings: DTOs.IUserRanking[] = [];

                        for (let user of users) {

                            let userRanking: DTOs.IUserRanking = {
                                Id: user._id.toHexString(),
                                Username: user.Username,
                                WinsCount: 0,
                                LossesCount: 0,
                                WinRatio: 0
                            };

                            for (let em of endedMatches) {
                                if (em.FirstPlayerSide.PlayerId.equals(user._id) || em.SecondPlayerSide.PlayerId.equals(user._id)) {
                                    if (em.WinnerId.equals(user._id)) {
                                        userRanking.WinsCount++;
                                    }
                                    else {
                                        userRanking.LossesCount++;
                                    }
                                }
                            }

                            if (userRanking.WinsCount > 0 && userRanking.LossesCount > 0)
                                userRanking.WinRatio = userRanking.WinsCount / (userRanking.WinsCount + userRanking.LossesCount);

                            rankings.push(userRanking);
                        }

                        rankings = rankings.sort((a, b) => {
                            if (a.WinRatio > b.WinRatio)
                                return -1;
                            if (a.WinRatio < b.WinRatio)
                                return 1;
                            else {
                                if (a.WinsCount > b.WinsCount)
                                    return -1;
                                if (a.WinsCount < b.WinsCount)
                                    return 1;
                                return a.Username.localeCompare(b.Username);
                            }
                        });

                        responseData = new net.HttpMessage(rankings);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
            });

        this._router.get(
            '/:' + RoutingParamKeys.userId,
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userId = request.params[RoutingParamKeys.userId];
                let responseData: net.HttpMessage<DTOs.IUserDto> = null;

                User.getModel()
                    .findById(userId)
                    .then((mongoUser) => {
                        let userDto: DTOs.IUserDto = {
                            Id: mongoUser.id,
                            Username: mongoUser.Username,
                            Age: moment().diff(mongoUser.BirthDate, "years", false),
                            CountryId: mongoUser.CountryId
                        };
                        responseData = new net.HttpMessage<DTOs.IUserDto>(userDto);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage<DTOs.IUserDto>(null, error.message);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    });
            });

        // DONT NOT ADD ROUTES WHICH DONT BEGIN WITH "/:" AFTER THIS ONE +++++++++++++++++++++++++++++++++++++
    }
}