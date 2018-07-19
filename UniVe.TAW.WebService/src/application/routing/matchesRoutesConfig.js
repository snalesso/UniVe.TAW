"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var httpStatusCodes = require("http-status-codes");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var Match = require("../../domain/models/mongodb/mongoose/Match");
var PendingMatch = require("../../domain/models/mongodb/mongoose/PendingMatch");
var chalk_1 = require("chalk");
var jwtValidator = expressJwt({ secret: process.env.JWT_KEY });
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var getUserPendingMatches = function (userId) {
    var criteria = {};
    criteria.PlayerId = new mongoose.Types.ObjectId(userId);
    return PendingMatch
        .getModel()
        .findOne(criteria);
};
router.post("/create", jwtValidator, function (request, response) {
    if (!request.user) {
        response
            .status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
    }
    else {
        var responseData_1 = null;
        var jwtUser = request.user;
        var jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);
        var pendingMatchCriteria_1 = {};
        pendingMatchCriteria_1.PlayerId = jwtUserObjectId;
        return PendingMatch
            .getModel()
            // ensure the user has no pending matches opened
            .findOne(pendingMatchCriteria_1)
            .then(function (existingPendingMatch) {
            if (existingPendingMatch) {
                responseData_1 = new net.HttpMessage(existingPendingMatch.id, "You already have a pending match!");
                response
                    .status(httpStatusCodes.FORBIDDEN)
                    .json(responseData_1);
            }
            else {
                // ensure the user isn't already playing
                var matchCriteria1 = {};
                matchCriteria1.FirstPlayerSide = {};
                matchCriteria1.FirstPlayerSide.PlayerId = pendingMatchCriteria_1.PlayerId;
                var matchCriteria2 = {};
                matchCriteria2.SecondPlayerSide = {};
                matchCriteria2.SecondPlayerSide.PlayerId = pendingMatchCriteria_1.PlayerId;
                Match.getModel()
                    .findOne({ $or: [matchCriteria1, matchCriteria2] })
                    .then(function (existingMatch) {
                    // if the user is already playing
                    if (existingMatch) {
                        responseData_1 = new net.HttpMessage(existingMatch.id, "You are already playing!");
                        response
                            .status(httpStatusCodes.FORBIDDEN)
                            .json(responseData_1);
                    }
                    else {
                        // if the user has no pending matches nor matches
                        var pendingMatchSkel = pendingMatchCriteria_1;
                        var newPendingMatch = PendingMatch.create(pendingMatchSkel);
                        PendingMatch
                            .getModel()
                            .create(newPendingMatch)
                            .then(function (newPendingMatch) {
                            responseData_1 = new net.HttpMessage(newPendingMatch.id);
                            response
                                .status(httpStatusCodes.CREATED)
                                .json(responseData_1);
                        })
                            .catch(function (error) {
                            responseData_1 = new net.HttpMessage(null, error.message);
                            response
                                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                                .json(responseData_1);
                        });
                    }
                })
                    .catch(); // TODO: handle
            }
        })
            .catch(function (error) {
            console.log(chalk_1.default.red("+++ Why are we here?"));
            responseData_1 = new net.HttpMessage(null, "Could not verify pending matches");
            response
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData_1);
        });
    }
});
router.get("/pending", jwtValidator, function (request, response) {
    var responseData = null;
    PendingMatch.getModel()
        .find()
        .then(function (matches) {
        var matchDtos = matches.map(function (m) { return ({
            Id: m._id.toHexString(),
            PlayerId: m.PlayerId.toHexString()
        }); });
        responseData = new net.HttpMessage(matchDtos);
        response
            .status(httpStatusCodes.OK)
            .json(matchDtos);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        response
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .json(responseData);
    });
});
var pendingMatchIdKey = "pendingMatchId";
router.post("/join/:" + pendingMatchIdKey, jwtValidator, function (request, response) {
    var responseData = null;
    var pendingMatchId = request.params[pendingMatchIdKey];
    if (!pendingMatchId) {
        responseData = new net.HttpMessage(null, "Unable to find requested match");
        response
            .status(httpStatusCodes.BAD_REQUEST)
            .json(responseData);
    }
    else {
        PendingMatch.getModel()
            .findById(pendingMatchId)
            .then(function (pendingMatch) {
            console.log(chalk_1.default.green("Pending match identified"));
            var jwtUser = request.user;
            var jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);
            // ensure the pending match is not joined by the same player who created it
            if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
                response.status(httpStatusCodes.FORBIDDEN)
                    .json(responseData);
            }
            else {
                var newMatchSkeleton = {};
                newMatchSkeleton.FirstPlayerSide = {};
                newMatchSkeleton.FirstPlayerSide.PlayerId = pendingMatch.PlayerId;
                newMatchSkeleton.SecondPlayerSide = {};
                newMatchSkeleton.SecondPlayerSide.PlayerId = jwtUserObjectId;
                Match
                    .create(newMatchSkeleton)
                    .save()
                    .then(function (createdMatch) {
                    console.log(chalk_1.default.green("New match created"));
                    PendingMatch.getModel()
                        .findByIdAndRemove(pendingMatch._id)
                        .then(function (deletedPendingMatch) {
                        console.log(chalk_1.default.green("Pending match deleted"));
                        responseData = new net.HttpMessage({
                            Id: createdMatch.id,
                            FirstPlayerId: createdMatch.FirstPlayerSide.PlayerId.toHexString(),
                            SecondPlayerId: createdMatch.SecondPlayerSide.PlayerId.toHexString(),
                            CreationDateTime: createdMatch.CreationDateTime
                        });
                        response
                            .status(httpStatusCodes.CREATED)
                            .json(responseData);
                    })
                        .catch(function (error) {
                        console.log(chalk_1.default.red("Shit happening: pending match found, new match created, pending match not deleted D:"));
                        responseData = new net.HttpMessage(null, "Unable to delete pendingMatch after creating the real match. Reason: " + error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
                })
                    .catch(function (error) {
                    responseData = new net.HttpMessage(null, error.message);
                    response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                });
            }
        })
            .catch(function (error) {
            console.log(chalk_1.default.red("Could not find requested pending match"));
            responseData = new net.HttpMessage(null, "Unable to find requested pending match. Reason: " + error.message);
            response
                .status(httpStatusCodes.NOT_FOUND)
                .json(responseData);
        });
    }
});
var matchIdKey = "matchId";
router.get("/:" + matchIdKey, function (request, response) {
    var responseData = null;
    var matchId = request.params[matchIdKey];
    Match.getModel()
        .findById(matchId)
        .then(function (match) {
        var matchDto = {
            Id: match.id,
            FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
            SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
            CreationDateTime: match.CreationDateTime
        };
        responseData = new net.HttpMessage(matchDto);
        response
            .status(httpStatusCodes.OK)
            .json(matchDto);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        response
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR) // TODO: INTERNAL_SERVER_ERROR or NOT_FOUND?
            .json(responseData);
    });
});
router.post("/:" + matchIdKey, function () {
});
exports.default = router;
//# sourceMappingURL=matchesRoutesConfig.js.map