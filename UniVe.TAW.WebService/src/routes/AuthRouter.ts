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
import { IMongooseMatch } from '../domain/models/mongodb/mongoose/Match';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/login', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const lc = req.body as DTOs.LoginCredentials;

    let statusCode: number;
    let errMsg: string = null;
    let responseData: net.HttpMessage<string>;

    if (!lc.Username || lc.Username.length <= 0)
        errMsg = "Username missing";
    if (!lc.Password || lc.Password.length <= 0)
        errMsg = "Password missing";

    const criteria = {} as User.IMongooseUser;
    criteria.Username = lc.Username;
    User.GetModel()
        .findOne(criteria)
        .then(user => {

            const InvalidCredentialsErrorMessage = "Invalid credentials";

            if (!user) {
                statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                responseData = new net.HttpMessage<string>(null, InvalidCredentialsErrorMessage)
            }
            else if (user.ValidatePassword(lc.Password)) {
                statusCode = httpStatusCodes.OK;
                let jwtPayload = new DTOs.UserJWTData(
                    JSON.stringify(user._id),
                    user.Username);
                let token = jwt.sign(
                    jwtPayload,
                    process.env.JWT_KEY,
                    {
                        expiresIn: 60 * 60
                    });
                responseData = new net.HttpMessage<string>(token);
                console.log("LOGIN: " + user.Username + " authenticated successfully!");
            } else {
                statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                errMsg = InvalidCredentialsErrorMessage;
            }

            res
                .status(statusCode)
                .json(responseData);
        })
        .catch((error: mongodb.MongoError) => {
            statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
            responseData = new net.HttpMessage<string>(null, error.message);
            res
                .status(statusCode)
                .json(responseData);
        });
});

router.post('/logout', (req: express.Request, res: express.Response, next: express.NextFunction) => {
});

export default router;