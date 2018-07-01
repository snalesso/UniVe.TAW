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
router.post("/create", jwtValidator, function (request, response) {
    if (!request.user) {
        response
            .status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
    }
    else {
        var responseData_1 = null;
        var jwtUser = request.user;
        var criteria_1 = {};
        criteria_1.PlayerId = new mongoose.Types.ObjectId(jwtUser.Id);
        PendingMatch
            .GetModel()
            .findOne(criteria_1)
            .then(function (existingPendingMatch) {
            if (existingPendingMatch) {
                responseData_1 = new net.HttpMessage(new DTOs.PendingMatchDto(existingPendingMatch.id, existingPendingMatch.PlayerId.toHexString()), "You already have a pending match!");
                response
                    .status(httpStatusCodes.FORBIDDEN)
                    .json(responseData_1);
            }
            else {
                var pendingMatchSkel = criteria_1;
                var newPendingMatch = PendingMatch.Create(pendingMatchSkel);
                PendingMatch
                    .GetModel()
                    .create(newPendingMatch)
                    .then(function (newPendingMatch) {
                    responseData_1 = new net.HttpMessage(new DTOs.PendingMatchDto(newPendingMatch.id, newPendingMatch.PlayerId.toHexString()));
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
        });
    }
});
router.get("/pending", function (request, response) {
    var responseData = null;
    PendingMatch.GetModel()
        .find()
        .then(function (matches) {
        var matchDtos = matches.map(function (m) { return new DTOs.PendingMatchDto(JSON.stringify(m.id), JSON.stringify(m.PlayerId)); });
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
router.post("/join/:pendingMatchId", function (req, res) {
    var responseData = null;
    var pendingMatchId = req.params["pendingMatchId"];
    var pmjr = req.body;
    if (!pmjr) {
        // TODO: handle
    }
    else {
        PendingMatch.GetModel()
            .findByIdAndRemove(pendingMatchId)
            .then(function (pendingMatch) {
            var responseStatus;
            var newMatchSkeleton = {};
            newMatchSkeleton.FirstPlayerId = pendingMatch.PlayerId;
            newMatchSkeleton.SecondPlayerId = new mongoose.Types.ObjectId(pmjr.PlayerId);
            var newMatch = Match.Create(newMatchSkeleton);
            newMatch
                .save()
                .then(function (createdMatch) {
                responseStatus = httpStatusCodes.CREATED;
                var newMatchDto = new DTOs.MatchDto(JSON.stringify(createdMatch.id), JSON.stringify(createdMatch.FirstPlayerId), JSON.stringify(createdMatch.SecondPlayerId), createdMatch.CreationDateTime);
                responseData = new net.HttpMessage(newMatchDto);
            })
                .catch(function () {
                responseStatus = httpStatusCodes.INTERNAL_SERVER_ERROR;
            });
            res
                .status(responseStatus)
                .json(responseData);
        })
            .catch(function (error) {
            responseData = new net.HttpMessage(null, "Unable to reach pending match. Reason: " + error.message);
            res
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        });
    }
});
router.get("/:matchId", function (req, res) {
    var responseData = null;
    var matchId = req.params["matchId"];
    PendingMatch.GetModel()
        .findById(matchId)
        .then(function (match) {
        var matchDto = new DTOs.PendingMatchDto(JSON.stringify(match.id), JSON.stringify(match.PlayerId));
        responseData = new net.HttpMessage(matchDto);
        res
            .status(httpStatusCodes.OK)
            .json(matchDto);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        res
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .json(responseData);
    });
});
router.post("/:matchId", function () {
});
exports.default = router;
//# sourceMappingURL=MatchesRouter.js.map