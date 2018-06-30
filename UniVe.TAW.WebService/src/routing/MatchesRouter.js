"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
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
router.post("/create", jwtValidator, function (req, res) {
    var responseData = null;
    var mcr = req.body;
    if (!mcr) {
        responseData = new net.HttpMessage(null, "Invalid request");
        res
            .status(httpStatusCodes.FORBIDDEN)
            .json(responseData);
    }
    else {
        var newPendingMatch = PendingMatch.Create(mcr);
        PendingMatch.GetModel()
            .create(newPendingMatch)
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    }
});
router.get("/pending", function (res) {
    var responseData = null;
    PendingMatch.GetModel()
        .find()
        .then(function (matches) {
        var matchDtos = matches.map(function (m) { return new DTOs.PendingMatchDto(JSON.stringify(m.PlayerId)); });
        responseData = new net.HttpMessage(matchDtos);
        res
            .status(httpStatusCodes.OK)
            .json(matchDtos);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        res
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
            newMatchSkeleton.SecondPlayerId = new mongoose.Schema.Types.ObjectId(pmjr.PlayerId);
            var newMatch = Match.Create(newMatchSkeleton);
            newMatch
                .save()
                .then(function (createdMatch) {
                responseStatus = httpStatusCodes.CREATED;
                var newMatchDto = new DTOs.MatchDto(JSON.stringify(createdMatch._id), JSON.stringify(createdMatch.FirstPlayerId), JSON.stringify(createdMatch.SecondPlayerId), createdMatch.CreationDateTime);
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
        var matchDto = new DTOs.PendingMatchDto(JSON.stringify(match.PlayerId));
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