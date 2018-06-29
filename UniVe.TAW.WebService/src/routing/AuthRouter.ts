import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as httpStatusCodes from 'http-status-codes';

import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';

import * as DTOs from '../DTOs/DTOs';
import * as net from '../../libs/unive.taw.framework/net';
import * as utils from '../../libs/unive.taw.framework/utils';
import * as passport from 'passport';
import * as passportHTTP from 'passport-http';

import * as User from '../domain/models/mongodb/mongoose/User';

const router = express.Router();

// middlewares

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

passport.use(new passportHTTP.BasicStrategy(
    (username, password, done) => {

        // Delegate function we provide to passport middleware
        // to verify user credentials

        console.log("New login attempt from ".green + username);
        const criteria = {} as User.IMongooseUser;
        criteria.Username = username;
        User.GetModel()
            .findOne(criteria, (error, user) => {
                if (error) {
                    return done({ statusCode: 500, error: true, errormessage: error });
                }
                if (!user) {
                    return done({ statusCode: 500, error: true, errormessage: "Invalid user" });
                }
                if (user.ValidatePassword(password)) {
                    return done(null, user);
                }
                return done({ statusCode: 500, error: true, errormessage: "Invalid password" });
            });
    }
));

// routes

router.post('/login', passport.authenticate('basic', { session: false }), (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    // TODO: use req.user instead (passed by passport)
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
                let jwtPayload: DTOs.IUserJWTData = {
                    Id: JSON.stringify(user._id),
                    Username: user.Username
                };
                let token = jwt.sign(
                    jwtPayload,
                    process.env.JWT_KEY,
                    {
                        expiresIn: 60 * 60
                    });
                responseData = new net.HttpMessage<string>(token);
                console.log("LOGIN SUCCESSFUL for " + user.Username + " (id: " + user._id + ")");
            } else {
                statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                errMsg = InvalidCredentialsErrorMessage;
            }

            res
                .status(statusCode)
                .json(responseData);
        })
        .catch((error: mongodb.MongoError) => {
            console.log("LOGIN FAILED: " + error.message);
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