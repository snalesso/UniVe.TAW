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
import * as utilsV2_8 from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as EndedMatch from '../../domain/models/mongodb/mongoose/EndedMatch';

import * as identityDTOs from '../DTOs/identity';
import * as gameDTOs from '../DTOs/game';
import * as chatDTOs from '../DTOs/chat';

import RoutingParamKeys from './RoutingParamKeys';
import * as moment from 'moment'
import RoutesBase from './RoutesBase';
import Events from '../Events';

export default class UsersRoutes extends RoutesBase {

    public constructor(socketIOServer: socketio.Server) {

        super(socketIOServer);

        this._router.post(
            '/',
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                let responseData: net.HttpMessage<boolean>;

                const signupReq = request.body as identityDTOs.ISignupRequestDto;

                if (!signupReq) {
                    response.status(httpStatusCodes.FORBIDDEN);
                } else {
                    let newUserSkel = {} as utilsV2_8.Mutable<User.IMongooseUser>;
                    newUserSkel.Username = signupReq.Username.trim();
                    newUserSkel.CountryId = signupReq.CountryId;
                    newUserSkel.BirthDate = signupReq.BirthDate;
                    newUserSkel.Role = identity.UserRole.Player;

                    let newUser = User.create(newUserSkel);
                    newUser.setPassword(signupReq.Password);
                    newUser.save()
                        .then(result => {
                            console.log("user created: " + JSON.stringify(result));
                            responseData = new net.HttpMessage(true);
                            response
                                .status(httpStatusCodes.CREATED)
                                .json(responseData);
                        })
                        .catch((error: mongodb.MongoError) => {
                            console.log("user creation failed: " + JSON.stringify(error));

                            const aeuCriteria = {} as utilsV2_8.Mutable<User.IMongooseUser>;
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
                                    responseData = new net.HttpMessage(false, errMsg);
                                    response
                                        .status(statusCode)
                                        .json(responseData);
                                });
                        });
                }
            });

        this._router.get(
            '/rankings',
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                //const userJWTPayload = (request.user as identityDTOs.IUserJWTPayload);
                //const userObjectId = new mongoose.Types.ObjectId(userJWTPayload.Id);
                let responseData: net.HttpMessage<identityDTOs.IUserRanking[]> = null;

                Promise
                    .all([
                        User.getModel().find().exec(),
                        EndedMatch.getModel().find().exec()
                    ])
                    .then(queries => {
                        const [users, endedMatches] = queries;

                        let rankings: identityDTOs.IUserRanking[] = [];

                        for (let user of users) {

                            let userRanking: identityDTOs.IUserRanking = {
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

                            if (userRanking.WinsCount + userRanking.LossesCount > 0) {
                                userRanking.WinRatio = userRanking.WinsCount / (userRanking.WinsCount + userRanking.LossesCount) * 100;
                                userRanking.WinRatio = Math.round(userRanking.WinRatio);
                            }

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

                        rankings = rankings.slice(0, 10);

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
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userHexId = request.params[RoutingParamKeys.userId];
                const userObjectId = new mongoose.Types.ObjectId(userHexId);
                let responseData: net.HttpMessage<identityDTOs.IUserProfile> = null;

                User.getModel()
                    .findById(userHexId)
                    .then((user) => {

                        if (user) {
                            EndedMatch.getModel()
                                .find({ $or: [{ "FirstPlayerSide.PlayerId": userHexId }, { "SecondPlayerSide.PlayerId": userHexId }] })
                                .then(userEndedMatches => {

                                    let profileDto: identityDTOs.IUserProfile = {
                                        Id: user.id,
                                        Username: user.Username,
                                        Age: user.getAge(),
                                        CountryId: user.CountryId,
                                        Role: user.Role,
                                        BannedUntil: user.BannedUntil != null && user.BannedUntil >= new Date() ? user.BannedUntil : null,
                                        WinsCount: (userEndedMatches && userEndedMatches.length > 0) ? userEndedMatches.filter(em => em.WinnerId.equals(userObjectId)).length : 0,
                                        LossesCount: (userEndedMatches && userEndedMatches.length > 0) ? userEndedMatches.filter(em => !em.WinnerId.equals(userObjectId)).length : 0
                                    };

                                    responseData = new net.HttpMessage(profileDto);
                                    response
                                        .status(httpStatusCodes.OK)
                                        .json(responseData);
                                });
                        }
                        else {
                            responseData = new net.HttpMessage(null, "user not found");
                            response
                                .status(httpStatusCodes.NOT_FOUND)
                                .json(responseData);
                        }
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
            });

        this._router.delete(
            '/:' + RoutingParamKeys.userId,
            this._jwtValidator,
            async (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userId = request.params[RoutingParamKeys.userId];
                let responseData: net.HttpMessage<boolean> = null;

                const jwtUser = (request.user as identityDTOs.IUserJWTPayload);
                const loggedUser = await User.getModel().findById(jwtUser.Id).exec();

                if (!loggedUser || loggedUser.Role != identity.UserRole.Administrator || (loggedUser.BannedUntil != null || loggedUser.BannedUntil < new Date())) {
                    responseData = new net.HttpMessage(false, "You have no power here!");
                    return response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                }

                const user = await User.getModel().findById(userId).exec();
                if (!user) {

                    responseData = new net.HttpMessage(false, "User not found!");
                    return response
                        .status(httpStatusCodes.NOT_FOUND)
                        .json(responseData);
                } else {

                    const deletedUser = await user.remove();

                    if (!deletedUser) {
                        responseData = new net.HttpMessage(false, "User deletion failed");
                        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    }

                    // immediately incapacitate user
                    this._socketIOServer.emit(Events.userEvent(deletedUser._id.toHexString(), Events.UserDeleted));

                    // delete matches

                    const pendingMatches = await PendingMatch.getModel()
                        .find({ PlayerId: new mongoose.Types.ObjectId(deletedUser._id.toHexString()) } as utilsV2_8.Mutable<PendingMatch.IMongoosePendingMatch>)
                        .exec();

                    if (pendingMatches.length > 0) {

                        for (let pm of pendingMatches) {
                            await pm.remove();
                        }

                        this._socketIOServer.emit(Events.PendingMatchesChanged);
                    }

                    const userModel = User.getModel();
                    const playingMatches = await Match.getModel()
                        .find({
                            $or: [
                                { "FirstPlayerSide.PlayerId": new mongoose.Types.ObjectId(deletedUser._id.toHexString()) },
                                { "SecondPlayerSide.PlayerId": new mongoose.Types.ObjectId(deletedUser._id.toHexString()) }
                            ]
                        })
                        .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                        .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                        .exec();

                    for (let pm of playingMatches) {
                        await pm.remove();

                        const fp = pm.FirstPlayerSide.PlayerId as any as User.IMongooseUser;
                        const sp = pm.SecondPlayerSide.PlayerId as any as User.IMongooseUser;
                        this._socketIOServer.emit(
                            Events.matchEventForUser(
                                fp != null ? fp._id.toHexString() : sp._id.toHexString(),
                                pm._id.toHexString(),
                                Events.MatchCanceled));
                    }

                    // delete chats

                    const users = await User.getModel().find().exec();

                    for (let user of users) {
                        if (user.SentMessages) {
                            if (user.SentMessages.has(deletedUser._id.toHexString())) {
                                user.SentMessages.delete(deletedUser._id.toHexString());
                                await user.save();
                            }
                        }
                    }

                    // TODO: notify removed chats

                    responseData = new net.HttpMessage(true);
                    return response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

        this._router.get(
            '/:' + RoutingParamKeys.userId + '/powers',
            this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userId = request.params[RoutingParamKeys.userId];
                let responseData: net.HttpMessage<identityDTOs.IUserPowers> = null;

                User.getModel()
                    .findById(userId)
                    .then((user) => {
                        let powers: identityDTOs.IUserPowers = {
                            Role: user.Role,
                            CanDeleteUser: user.Role == identity.UserRole.Administrator,
                            CanAssignRoles: user.Role == identity.UserRole.Administrator,
                            CanPermaBan: user.Role == identity.UserRole.Administrator,
                            CanTemporarilyBan: (user.Role == identity.UserRole.Administrator || user.Role == identity.UserRole.Moderator)
                        };
                        responseData = new net.HttpMessage(powers);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    })
                    .catch((error: mongodb.MongoError) => {
                        responseData = new net.HttpMessage(null, error.message);
                        response
                            .status(httpStatusCodes.OK)
                            .json(responseData);
                    });
            });

        this._router.post(
            '/:' + RoutingParamKeys.userId + '/ban',
            this._jwtValidator,
            async (request: express.Request, response: express.Response) => {

                const jwtUser = (request.user as identityDTOs.IUserJWTPayload);

                let responseData: net.HttpMessage<Date>;

                const banReq = request.body as identityDTOs.IUserBanRequest;

                const currUser = await User.getModel().findById(jwtUser.Id).exec();
                const userToBan = await User.getModel().findById(banReq.UserId).exec();

                // admin can do anything
                // mods can operate on simple players only
                if (currUser.Role == identity.UserRole.Administrator
                    || (currUser.Role == identity.UserRole.Moderator
                        && userToBan.Role == identity.UserRole.Player)) {

                    userToBan.BannedUntil =
                        banReq.BanDurationHours >= 0
                            ? (banReq.BanDurationHours > 0)
                                // positive hours -> temporary ban
                                ? moment().add(moment.duration(banReq.BanDurationHours, "hours")).toDate()
                                // 0 hours -> unban
                                : null
                            // negative hours -> ban forever (max date value)
                            : new Date(8640000000000000);

                    userToBan.save();

                    this._socketIOServer.emit(Events.userEvent(userToBan.id, Events.UserBanned), userToBan.BannedUntil);

                    responseData = new net.HttpMessage(userToBan.BannedUntil);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);

                    // find pending/playing matches and delete them

                    const pendingMatches = await PendingMatch.getModel()
                        .find({ PlayerId: new mongoose.Types.ObjectId(userToBan._id.toHexString()) } as utilsV2_8.Mutable<PendingMatch.IMongoosePendingMatch>)
                        .exec();

                    if (pendingMatches.length > 0) {

                        for (let pm of pendingMatches) {
                            await pm.remove();
                        }

                        this._socketIOServer.emit(Events.PendingMatchesChanged);
                    }

                    const userModel = User.getModel();
                    const playingMatches = await Match.getModel()
                        .find({
                            $or: [
                                { "FirstPlayerSide.PlayerId": new mongoose.Types.ObjectId(userToBan._id.toHexString()) },
                                { "SecondPlayerSide.PlayerId": new mongoose.Types.ObjectId(userToBan._id.toHexString()) }
                            ]
                        })
                        .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                        .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                        .exec();

                    for (let pm of playingMatches) {
                        await pm.remove();

                        const fp = pm.FirstPlayerSide.PlayerId as any as User.IMongooseUser;
                        const sp = pm.SecondPlayerSide.PlayerId as any as User.IMongooseUser;
                        this._socketIOServer.emit(
                            Events.matchEventForUser(
                                fp._id.equals(userToBan._id) ? sp._id.toHexString() : fp._id.toHexString(),
                                pm._id.toHexString(),
                                Events.MatchCanceled));
                    }

                } else {
                    responseData = new net.HttpMessage(null, "You have no power here");
                    response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                }
            });

        this._router.post(
            '/:' + RoutingParamKeys.userId + '/role',
            this._jwtValidator,
            async (request: express.Request, response: express.Response) => {

                const jwtUser = (request.user as identityDTOs.IUserJWTPayload);

                let responseData: net.HttpMessage<identity.UserRole>;

                const userToAssignRoleHexId = request.params[RoutingParamKeys.userId];
                const roleAssignmentRequest = request.body as identityDTOs.IRoleAssignmentRequestDto;

                const currUser = await User.getModel().findById(jwtUser.Id).exec();
                const userToAssignRole = await User.getModel().findById(userToAssignRoleHexId).exec();

                // only admins can assign roles
                if (currUser.Role != identity.UserRole.Administrator) {
                    responseData = new net.HttpMessage(null, "You have no power here");
                    response
                        .status(httpStatusCodes.UNAUTHORIZED)
                        .json(responseData);
                    return;
                }
                else if (userToAssignRole.Role == roleAssignmentRequest.NewRole) {
                    responseData = new net.HttpMessage(null, "Target user is already on the same role");
                    response
                        .status(httpStatusCodes.BAD_REQUEST)
                        .json(responseData);
                    return;
                }
                else {
                    userToAssignRole.Role = roleAssignmentRequest.NewRole;

                    userToAssignRole.save();

                    // TODO: send full user powers instead
                    this._socketIOServer.emit(Events.userEvent(userToAssignRole.id, Events.UserRoleUpdated), userToAssignRole.Role);

                    responseData = new net.HttpMessage(userToAssignRole.Role);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });

        this._router.get(
            '/:' + RoutingParamKeys.userId + '/matchHistory',
            //this._jwtValidator,
            (request: express.Request, response: express.Response, next: express.NextFunction) => {

                const userHexId = request.params[RoutingParamKeys.userId];
                let responseData: net.HttpMessage<gameDTOs.IEndedMatchSummaryDto[]> = null;

                const userModel = User.getModel();

                EndedMatch.getModel()
                    .find({
                        $or: [
                            { "FirstPlayerSide.PlayerId": new mongoose.Types.ObjectId(userHexId) },
                            { "SecondPlayerSide.PlayerId": new mongoose.Types.ObjectId(userHexId) }
                        ]
                    })
                    .populate({ path: "FirstPlayerSide.PlayerId", model: userModel })
                    .populate({ path: "SecondPlayerSide.PlayerId", model: userModel })
                    .then((endedMatches) => {

                        let emDtos = endedMatches.map(em => {

                            const fp = em.FirstPlayerSide.PlayerId as any as User.IMongooseUser;
                            const sp = em.SecondPlayerSide.PlayerId as any as User.IMongooseUser;

                            return ({
                                Id: em._id.toHexString(),
                                EndDateTime: em.EndDateTime,
                                WinnerId: em.WinnerId.toHexString(),
                                FirstPlayer: {
                                    Id: fp != null ? fp._id.toHexString() : null,
                                    Username: fp != null ? fp.Username : null
                                },
                                SecondPlayer: {
                                    Id: sp != null ? sp._id.toHexString() : null,
                                    Username: sp != null ? sp.Username : null
                                }
                            } as gameDTOs.IEndedMatchSummaryDto);
                        });

                        emDtos = emDtos.sort((a, b) => {
                            const dateSort = (b.EndDateTime.valueOf() - a.EndDateTime.valueOf());
                            return dateSort != 0
                                ? dateSort
                                : a.FirstPlayer.Username.localeCompare(b.SecondPlayer.Username);
                        });

                        emDtos = emDtos.slice(0, 20);

                        responseData = new net.HttpMessage(emDtos);
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
    }
}