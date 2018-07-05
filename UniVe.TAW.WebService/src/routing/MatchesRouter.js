"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Match = require("../domain/models/mongodb/mongoose/Match");
var PendingMatch = require("../domain/models/mongodb/mongoose/PendingMatch");
var DTOs = require("../DTOs/DTOs");
var httpStatusCodes = require("http-status-codes");
var net = require("../../libs/unive.taw.framework/net");
var expressJwt = require("express-jwt");
require("colors");
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
        var jwtUserObjectId_1 = new mongoose.Types.ObjectId(jwtUser.Id);
        getUserPendingMatches(jwtUserObjectId_1)
            .then(function (existingPendingMatch) {
            if (existingPendingMatch) {
                responseData_1 = new net.HttpMessage(existingPendingMatch.id, "You already have a pending match!");
                response
                    .status(httpStatusCodes.FORBIDDEN)
                    .json(responseData_1);
            }
            else {
                var pendingMatchSkel = {};
                pendingMatchSkel.PlayerId = jwtUserObjectId_1;
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
            .catch(function (error) {
            console.log("+++ Why are we here?".red);
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
        var matchDtos = matches.map(function (m) { return new DTOs.PendingMatchDto(m.id, m.PlayerId.toHexString()); });
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
            console.log("Pending match identified".green);
            var jwtUser = request.user;
            var jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);
            if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
                response.status(httpStatusCodes.FORBIDDEN)
                    .json(responseData);
            }
            else {
                var newMatchSkeleton = {};
                newMatchSkeleton.FirstPlayerId = pendingMatch.PlayerId;
                newMatchSkeleton.SecondPlayerId = jwtUserObjectId;
                Match
                    .create(newMatchSkeleton)
                    .save()
                    .then(function (createdMatch) {
                    console.log("New match created".green);
                    PendingMatch.getModel()
                        .findByIdAndRemove(pendingMatch._id)
                        .then(function (deletedPendingMatch) {
                        console.log("Pending match deleted".green);
                        responseData = new net.HttpMessage(new DTOs.MatchDto(createdMatch.id, createdMatch.FirstPlayerId.toHexString(), createdMatch.SecondPlayerId.toHexString(), createdMatch.CreationDateTime));
                        response
                            .status(httpStatusCodes.CREATED)
                            .json(responseData);
                    })
                        .catch(function (error) {
                        console.log("Shit happening: pending match found, new match created, pending match not deleted D:".red);
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
            console.log("Could not find requested pending match".red);
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
        var matchDto = new DTOs.MatchDto(match.id, match.FirstPlayerId.toHexString(), match.SecondPlayerId.toHexString(), match.CreationDateTime);
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
//# sourceMappingURL=MatchesRouter.js.map