"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var httpStatusCodes = require("http-status-codes");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var game = require("../../infrastructure/game");
var RoutingParamKeys_1 = require("./RoutingParamKeys");
var User = require("../../domain/models/mongodb/mongoose/User");
var Match = require("../../domain/models/mongodb/mongoose/Match");
var PendingMatch = require("../../domain/models/mongodb/mongoose/PendingMatch");
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
function getUsersPlayingMatch(userId) {
    var matchCriteria1 = {};
    matchCriteria1.FirstPlayerSide = {};
    matchCriteria1.FirstPlayerSide.PlayerId = userId;
    var matchCriteria2 = {};
    matchCriteria2.SecondPlayerSide = {};
    matchCriteria2.SecondPlayerSide.PlayerId = userId;
    return Match.getModel()
        // TODO: fix OR in criteria
        .findOne(matchCriteria1 /*, matchCriteria2*/)
        // .populate("InActionPlayerId")
        // .populate("FirstPlayerSide.PlayerId")
        // .populate("SecondPlayerSide.PlayerId")
        .then(function (playingMatch) {
        return playingMatch;
        // if (playingMatch == null)
        //     return null;
        // const enemySide = playingMatch.getEnemyMatchPlayerSide(userId);
        // return {
        //     Id: playingMatch.id.toHexString(),
        //     Enemy: {
        //         Id: enemySide.PlayerId.toHexString(),
        //         // TODO: complete
        //         //Username: enemySide.PlayerId.Username
        //         // Country
        //         //Age: enemySide.Plauer
        //     } as DTOs.IUserDto
        // } as DTOs.IPlayingMatchDto;
    })
        .catch(function (error) {
        // TODO: handle
        console.log(chalk_1.default.red("+++ Why are we here?"));
        throw new Error("WTF");
    });
}
function getUsersPendingMatch(userId) {
    var criteria = {};
    criteria.PlayerId = userId;
    return PendingMatch.getModel()
        .findOne(criteria)
        .then(function (pendingMatch) {
        return pendingMatch;
    })
        .catch(function (error) {
        // TODO: handle
        console.log(chalk_1.default.red("+++ Why are we here?"));
        throw new Error("WTF");
    });
}
function hasOpenMatches(userId) {
    var pendingMatchCriteria = {};
    pendingMatchCriteria.PlayerId = userId;
    return PendingMatch
        .getModel()
        // ensure the user has no pending matches opened
        .findOne(pendingMatchCriteria)
        .then(function (existingPendingMatch) {
        if (existingPendingMatch) {
            return true;
        }
        // ensure the user isn't already playing
        var matchCriteria1 = {};
        matchCriteria1.FirstPlayerSide = {};
        matchCriteria1.FirstPlayerSide.PlayerId = pendingMatchCriteria.PlayerId;
        var matchCriteria2 = {};
        matchCriteria2.SecondPlayerSide = {};
        matchCriteria2.SecondPlayerSide.PlayerId = pendingMatchCriteria.PlayerId;
        return Match.getModel()
            .findOne({ $or: [matchCriteria1, matchCriteria2] })
            .then(function (existingMatch) {
            return existingMatch != null;
        })
            .catch(function (error) {
            // TODO: handle
            console.log(chalk_1.default.red("+++ Why are we here?"));
            throw new Error("WTF");
        });
    })
        .catch(function (error) {
        // TODO: handle
        console.log(chalk_1.default.red("+++ Why are we here?"));
        throw new Error("WTF");
    });
}
router.get("/canCreateMatch", jwtValidator, function (request, response) {
    var responseData = null;
    var userJWTData = request.user;
    var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
    hasOpenMatches(userObjectId)
        .then(function (hasOpenMatches) {
        responseData = new net.HttpMessage(!hasOpenMatches);
        response
            .status(httpStatusCodes.OK)
            .json(responseData);
    })
        .catch(function (error) {
        // TODO: handle
        console.log(chalk_1.default.red("+++ Why are we here?"));
        throw new Error("WTF");
    });
});
var getPlayables = function (userId) {
    var playables = {};
    return getUsersPendingMatch(userId)
        .then(function (pendingMatch) {
        if (pendingMatch) {
            playables.PendingMatchId = pendingMatch.id;
        }
        return getUsersPlayingMatch(userId)
            .then(function (playingMatch) {
            if (playingMatch != null) {
                playables.PlayingMatch = {
                    Id: playingMatch._id.toHexString(),
                };
            }
            playables.CanCreateMatch = (playables.PendingMatchId == null && playables.PlayingMatch == null);
            // if can't create a match it means can't join, then it's useless to query joinable matches
            if (!playables.CanCreateMatch) {
                return playables;
            }
            return PendingMatch.getModel()
                .find({ PlayerId: { $ne: userId } })
                .populate({ path: "PlayerId", model: User.getModel() })
                .then(function (joinableMatches) {
                playables.JoinableMatches = joinableMatches.map(function (jm) {
                    var creator = jm.PlayerId;
                    return {
                        Id: jm._id.toHexString(),
                        Creator: {
                            Id: creator._id.toHexString(),
                            Username: creator.Username,
                            Age: creator.getAge(),
                            CountryId: creator.CountryId
                        }
                    };
                });
                return playables;
            })
                .catch(function (error) {
                console.log(error);
                return null;
            });
        })
            .catch(function (error) {
            console.log(error);
            return null;
        });
    })
        .catch(function (error) {
        console.log(error);
        return null;
    });
};
router.get("/playables", jwtValidator, function (request, response) {
    var responseData = null;
    var userJWTData = request.user;
    var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
    var playables = getPlayables(userObjectId)
        .then(function (playables) {
        responseData = new net.HttpMessage(playables);
        response
            .status(httpStatusCodes.OK)
            .json(responseData);
    })
        .catch(function (error) {
        console.log(error);
    });
});
router.post("/createPendingMatch", jwtValidator, function (request, response) {
    if (!request.user) {
        response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
        return;
    }
    var responseData = null;
    var userJWTData = request.user;
    var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
    var pendingMatchCriteria = {};
    pendingMatchCriteria.PlayerId = userObjectId;
    hasOpenMatches(userObjectId)
        .then(function (hasOpenMatches) {
        // if the user is already playing
        if (hasOpenMatches) {
            responseData = new net.HttpMessage(null, "You are already playing!"); // TODO: switch to specific error codes
            response
                .status(httpStatusCodes.FORBIDDEN)
                .json(responseData);
            return;
        }
        // if the user has no pending matches / matches
        var pendingMatchSkel = pendingMatchCriteria;
        var newPendingMatch = PendingMatch.create(pendingMatchSkel);
        PendingMatch
            .getModel()
            .create(newPendingMatch)
            .then(function (newPendingMatch) {
            responseData = new net.HttpMessage(newPendingMatch.id);
            response
                .status(httpStatusCodes.CREATED)
                .json(responseData);
        })
            .catch(function (error) {
            responseData = new net.HttpMessage(null, error.message);
            response
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        });
    })
        .catch(function (error) {
        // TODO: handle
        console.log(chalk_1.default.red("+++ Why are we here?"));
        throw new Error("WTF");
    });
});
router.post("/closePendingMatch" + "/:" + RoutingParamKeys_1.default.PendingMatchId, jwtValidator, function (request, response) {
    if (!request.user) {
        response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
        return;
    }
    var responseData = null;
    var userJWTData = request.user;
    var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
    var pendingMatchCriteria = {};
    pendingMatchCriteria.PlayerId = userObjectId;
    pendingMatchCriteria._id = new mongoose.Types.ObjectId(request.params[RoutingParamKeys_1.default.PendingMatchId]);
    PendingMatch
        .getModel()
        .findOne(pendingMatchCriteria)
        .then(function (pendingMatch) {
        if (pendingMatch) {
            pendingMatch
                .remove()
                .then(function (result) {
                responseData = new net.HttpMessage(true);
                response
                    .status(httpStatusCodes.OK)
                    .json(responseData);
            })
                .catch(function (error) {
                responseData = new net.HttpMessage(false, error.message);
                response
                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                    .json(responseData);
            });
        }
        else {
            responseData = new net.HttpMessage(false, "Requested PendingMatch not found");
            response
                .status(httpStatusCodes.NOT_FOUND)
                .json(responseData);
        }
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(false, error.message);
        response
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .json(responseData);
    });
});
// TODO: ensure can't join a match if already playing
router.post("/join/:" + RoutingParamKeys_1.default.PendingMatchId, jwtValidator, function (request, response) {
    var responseData = null;
    var pendingMatchId = request.params[RoutingParamKeys_1.default.PendingMatchId];
    if (!pendingMatchId) {
        responseData = new net.HttpMessage(null, "Unable to find requested match");
        response
            .status(httpStatusCodes.BAD_REQUEST)
            .json(responseData);
        return;
    }
    PendingMatch.getModel()
        .findById(pendingMatchId)
        .then(function (pendingMatch) {
        console.log(chalk_1.default.green("Pending match identified"));
        var jwtUser = request.user;
        var jwtUserObjectId = new mongoose.Types.ObjectId(jwtUser.Id);
        // ensure the pending match is not joined by the same player who created it
        if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
            responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
            response
                .status(httpStatusCodes.FORBIDDEN)
                .json(responseData);
            return;
        }
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
                // match created but couldn't delete the original pending match :O
                .catch(function (error) {
                console.log(chalk_1.default.red("Shit happening: pending match found, new match created, pending match not deleted D:"));
                responseData = new net.HttpMessage(null, "Unable to delete pendingMatch after creating the real match. Reason: " + error.message);
                response
                    .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                    .json(responseData);
            });
        })
            // error when creating the match
            .catch(function (error) {
            responseData = new net.HttpMessage(null, error.message);
            response
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        });
    })
        // if the provided id for the pending match to join is not found
        .catch(function (error) {
        console.log(chalk_1.default.red("Could not find requested pending match"));
        responseData = new net.HttpMessage(null, "Unable to find requested pending match. Reason: " + error.message);
        response
            .status(httpStatusCodes.NOT_FOUND)
            .json(responseData);
    });
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
router.get("/:" + RoutingParamKeys_1.default.MatchId, jwtValidator, function (request, response) {
    var responseData = null;
    var matchId = request.params[RoutingParamKeys_1.default.MatchId];
    Match.getModel()
        .findById(matchId)
        // .populate("FirstPlayerSide.PlayerId")
        // .populate("SecondPlayerSide.PlayerId")
        // .populate("InActionPlayerId")
        .then(function (match) {
        var matchInfoDto = {
            Id: match.id,
            FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
            SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
            CreationDateTime: match.CreationDateTime,
            Settings: {}
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