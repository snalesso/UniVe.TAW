import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';

import * as net from '../../infrastructure/net';
import * as identity from '../../infrastructure/identity';
import * as utils from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';

import * as DTOs from '../DTOs';
import * as moment from 'moment'

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(httpStatusCodes.OK).json({});
    }
    next();
});

router.post(
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

const userIdKey = "userId";
router.get(
    "/:" + userIdKey,
    (request: express.Request, response: express.Response, next: express.NextFunction) => {

        const userId = request.params[userIdKey];
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

// TODO: add authentication and allow delete only to same user
router.delete(
    "/:" + userIdKey,
    (request: express.Request, response: express.Response, next: express.NextFunction) => {

        const userId = request.params[userIdKey];
        let responseData: net.HttpMessage<boolean> = null;

        User.getModel()
            .findByIdAndRemove(
                userId,
                (error: mongodb.MongoError, deletedUser) => {
                    if (error) {
                        responseData = new net.HttpMessage<boolean>(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    }
                    else if (!deletedUser) {
                        responseData = new net.HttpMessage<boolean>(null, "User not found!");
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    }
                    else {
                        responseData = new net.HttpMessage<boolean>(true);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    }
                });
    });

export default router;