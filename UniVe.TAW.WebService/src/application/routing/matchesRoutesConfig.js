"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var httpStatusCodes = require("http-status-codes");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var game = require("../../infrastructure/game");
var Match = require("../../domain/models/mongodb/mongoose/Match");
var PendingMatch = require("../../domain/models/mongodb/mongoose/PendingMatch");
var RoutingParamKeys_1 = require("./RoutingParamKeys");
var chalk_1 = require("chalk");
// TODO: rename to gameRoutesConfig?
var jwtValidator = expressJwt({ secret: process.env.JWT_KEY });
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(httpStatusCodes.OK).json({});
    }
    next();
});
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
router.get("/joinables", jwtValidator, function (request, response) {
    var responseData = null;
    PendingMatch.getModel()
        .find()
        .populate("PlayerId")
        .then(function (matches) {
        var matchDtos = matches.map(function (m) { return ({
            Id: m._id.toHexString(),
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
router.post("/join/:" + RoutingParamKeys_1.default.PendingMatchId, jwtValidator, function (request, response) {
    var responseData = null;
    var pendingMatchId = request.params[RoutingParamKeys_1.default.PendingMatchId];
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
// TODO: complete, check everything workd as expected 
router.get("/newMatchSettings", jwtValidator, function (request, response) {
    var dnms = new game.MatchSettings();
    var responseData = new net.HttpMessage({
        MinShipDistance: dnms.MinShipsDistance,
        ShipTypeAvailability: dnms.AvailableShips.map(function (as) {
            return {
                Count: as.Count,
                ShipType: as.ShipType
            };
        }),
        BattleFieldSettings: {
            BattleFieldWidth: dnms.BattleFieldSettings.BattleFieldWidth,
            BattleFieldHeight: dnms.BattleFieldSettings.BattleFieldHeight,
        }
    });
    response
        //.type("application/json")
        .status(httpStatusCodes.OK)
        .send(responseData);
});
router.get("/sta", jwtValidator, function (request, response) {
    var sta = new game.ShipTypeAvailability(game.ShipType.Battleship, 3);
    response
        //.type("application/json")
        .status(httpStatusCodes.OK)
        .send(new net.HttpMessage({ ShipType: sta.ShipType, Count: sta.Count }));
});
router.get("/:" + RoutingParamKeys_1.default.MatchId, jwtValidator, function (request, response) {
    var responseData = null;
    var matchId = request.params[RoutingParamKeys_1.default.MatchId];
    Match.getModel()
        .findById(matchId)
        .populate("")
        .then(function (match) {
        var matchInfoDto = {
            Id: match.id,
            FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
            SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
            CreationDateTime: match.CreationDateTime,
            Settings: match.Settings
        };
        responseData = new net.HttpMessage(matchInfoDto);
        response
            .status(httpStatusCodes.OK)
            .json(matchInfoDto);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        response
            .status(httpStatusCodes.NOT_FOUND)
            .json(responseData);
    });
});
router.post("/:" + RoutingParamKeys_1.default.MatchId, jwtValidator, function () {
});
exports.default = router;
//# sourceMappingURL=matchesRoutesConfig.js.map