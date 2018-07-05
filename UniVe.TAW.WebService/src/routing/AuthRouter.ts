import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';
import * as passport from 'passport';
import * as passportHTTP from 'passport-http';
import * as jwt from 'jsonwebtoken';
import * as mongodb from 'mongodb';

import * as User from '../domain/models/mongodb/mongoose/User';
import * as DTOs from '../DTOs/DTOs';

import * as net from '../../libs/unive.taw.framework/net';

const router = express.Router();

// middlewares

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

passport.use(new passportHTTP.BasicStrategy(
    (username, password, done) => {
        console.log("Passport validating credentials ... ".yellow);

        const criteria = {} as User.IMongooseUser;
        criteria.Username = username;
        User.getModel()
            .findOne(criteria, (error, user: User.IMongooseUser) => {
                if (error) {
                    return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: error });
                }
                if (!user) {
                    return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: "Invalid user" });
                }
                if (user.validatePassword(password)) {
                    return done(null, user);
                }
                return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: "Invalid password" });
            });
    }
));

// routes

router.post(
    '/login',
    passport.authenticate('basic', { session: false }),
    (request: express.Request, response: express.Response) => {
        const user = request.user as User.IMongooseUser;

        let statusCode: number;
        let errMsg: string;
        let responseData: net.HttpMessage<string>;

        if (!user) {
            console.log("Login failed!".red);
            statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
            responseData = new net.HttpMessage<string>(null, "Invalid credentials");
        }
        else {
            console.log("Login successful for ".green + user.Username + " (id: " + user.id + ")");
            statusCode = httpStatusCodes.OK;
            let jwtPayload: DTOs.IUserJWTData = {
                Id: user.id,
                Username: user.Username
            };
            let token = jwt.sign(
                jwtPayload,
                process.env.JWT_KEY,
                {
                    expiresIn: 60 * 60 // 60 mins
                });
            responseData = new net.HttpMessage<string>(token);
        }

        response
            .status(statusCode)
            .json(responseData);
    });

router.post('/logout', () => { });

export default router;