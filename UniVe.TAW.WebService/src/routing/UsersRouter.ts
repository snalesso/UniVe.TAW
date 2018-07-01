import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as httpStatusCodes from 'http-status-codes';

import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';

import * as DTOs from '../DTOs/DTOs';
import * as net from '../../libs/unive.taw.framework/net';
import * as utils from '../../libs/unive.taw.framework/utils';

import * as User from '../domain/models/mongodb/mongoose/User';
import * as user_enums from '../domain/enums/user';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/signup', (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let responseData: net.HttpMessage<boolean>;

    let signupReq = req.body as DTOs.SignupRequestDto;

    // TODO: test all branches
    if (!signupReq) {
        res.status(httpStatusCodes.FORBIDDEN);
    } else {
        //let feawfw = signupReq as User.IMongoUser;
        let newUserSkel = {} as User.IMongooseUser;
        newUserSkel.Username = signupReq.Username;
        newUserSkel.CountryId = signupReq.CountryId;
        newUserSkel.BirthDate = signupReq.BirthDate;
        newUserSkel.Roles = user_enums.UserRoles.Player;

        let newUser = User.Create(newUserSkel);
        newUser.SetPassword(signupReq.Password);
        newUser.save()
            .then(result => {
                console.log("user created: " + JSON.stringify(result));
                responseData = new net.HttpMessage<boolean>(true);
                res
                    .status(httpStatusCodes.CREATED)
                    .json(responseData);
            })
            .catch((error: mongodb.MongoError) => {
                console.log("user creation failed: " + JSON.stringify(error));

                let aeuCriteria = {} as User.IMongooseUser;
                aeuCriteria.Username = newUser.Username;
                const alreadyExistingUser = User.GetModel().findOne(aeuCriteria).then((takenUser) => {

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
                    res
                        .status(statusCode)
                        .json(responseData);
                });
            });
    }
});

router.get('/:userId', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.params["userId"];
    let responseData: net.HttpMessage<DTOs.UserDto> = null;
    User.GetModel()
        .findById(userId)
        .then((mongoUser) => {
            let userDto: DTOs.UserDto = new DTOs.UserDto(
                mongoUser.id,
                mongoUser.Username,
                utils.GetAge(mongoUser.BirthDate),
                mongoUser.CountryId);
            responseData = new net.HttpMessage<DTOs.UserDto>(userDto);
            res
                .status(httpStatusCodes.OK)
                .json(responseData);
        })
        .catch((error: mongodb.MongoError) => {
            responseData = new net.HttpMessage<DTOs.UserDto>(null, error.message);
            res
                .status(httpStatusCodes.OK)
                .json(responseData);
        });
});

// TODO: add authentication and allow delete only to same user
router.delete("/:userId", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.params["userId"];
    let responseData: net.HttpMessage<boolean> = null;
    User.GetModel()
        .findByIdAndRemove(
            userId,
            (error: mongodb.MongoError, deletedUser) => {
                if (error) {
                    responseData = new net.HttpMessage<boolean>(null, error.message);
                    res
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }
                else if (!deletedUser) {
                    responseData = new net.HttpMessage<boolean>(null, "User not found!");
                    res
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }
                else {
                    responseData = new net.HttpMessage<boolean>(true);
                    res
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });
});

export default router;