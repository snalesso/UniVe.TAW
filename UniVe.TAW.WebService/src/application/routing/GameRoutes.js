"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var httpStatusCodes = require("http-status-codes");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var game = require("../../infrastructure/game");
var RoutingParamKeys_1 = require("./RoutingParamKeys");
var ServiceEventKeys_1 = require("../services/ServiceEventKeys");
var User = require("../../domain/models/mongodb/mongoose/User");
var Match = require("../../domain/models/mongodb/mongoose/Match");
var PendingMatch = require("../../domain/models/mongodb/mongoose/PendingMatch");
var chalk_1 = require("chalk");
var RoutesBase_1 = require("./RoutesBase");
var GameRoutes = /** @class */ (function (_super) {
    __extends(GameRoutes, _super);
    function GameRoutes(socketIOServer) {
        var _this = _super.call(this, socketIOServer) || this;
        _this._jwtValidator = expressJwt({ secret: process.env.JWT_KEY });
        _this._router.use(bodyParser.urlencoded({ extended: true }));
        _this._router.use(bodyParser.json());
        _this._router.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
                return res.status(httpStatusCodes.OK).json({});
            }
            next();
        });
        _this._router.get("/canCreateMatch", _this._jwtValidator, function (request, response) {
            var responseData = null;
            var userJWTData = request.user;
            var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
            _this.hasOpenMatches(userObjectId)
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
        _this._router.get("/playables", _this._jwtValidator, function (request, response) {
            var responseData = null;
            var userJWTData = request.user;
            var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
            _this.getPlayables(userObjectId)
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
        _this._router.post("/createPendingMatch", _this._jwtValidator, function (request, response) {
            if (!request.user) {
                response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                return;
            }
            var responseData = null;
            var userJWTData = request.user;
            var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
            var pendingMatchCriteria = {
                PlayerId: userObjectId
            };
            _this.hasOpenMatches(userObjectId)
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
        _this._router.post("/closePendingMatch" + "/:" + RoutingParamKeys_1.default.PendingMatchId, _this._jwtValidator, function (request, response) {
            if (!request.user) {
                response.status(httpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED);
                return;
            }
            var responseData = null;
            var userJWTData = request.user;
            var userObjectId = new mongoose.Types.ObjectId(userJWTData.Id);
            var pendingMatchCriteria = {
                PlayerId: userObjectId,
                _id: new mongoose.Types.ObjectId(request.params[RoutingParamKeys_1.default.PendingMatchId])
            };
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
        _this._router.post("/joinPendingMatch/:" + RoutingParamKeys_1.default.PendingMatchId, _this._jwtValidator, function (request, response) {
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
                // ensure the pending match is not trying to be joined by the same player who created it
                if (pendingMatch.PlayerId.toHexString() === jwtUser.Id) {
                    responseData = new net.HttpMessage(null, "You cannot join your own match! -.-\"");
                    response
                        .status(httpStatusCodes.FORBIDDEN)
                        .json(responseData);
                    return;
                }
                pendingMatch.remove()
                    .then(function (deletedPendingMatch) {
                    console.log(chalk_1.default.green("PendingMatch (id: " + deletedPendingMatch._id.toHexString() + ") deleted"));
                    var newMatchSkel = {
                        FirstPlayerSide: {
                            PlayerId: pendingMatch.PlayerId
                        },
                        SecondPlayerSide: {
                            PlayerId: jwtUserObjectId
                        },
                        Settings: {
                            MinShipsDistance: 2,
                            BattleFieldHeight: 10,
                            BattleFieldWidth: 10,
                            AvailableShips: [
                                { ShipType: game.ShipType.Destroyer, Count: 4 },
                                { ShipType: game.ShipType.Submarine, Count: 2 },
                                { ShipType: game.ShipType.Battleship, Count: 2 },
                                { ShipType: game.ShipType.Carrier, Count: 1 }
                            ]
                        }
                    };
                    Match
                        .create(newMatchSkel)
                        .save()
                        .then(function (createdMatch) {
                        console.log(chalk_1.default.green("New match created (id:" + createdMatch._id.toHexString() + ")"));
                        _this._socketIOServer.emit(ServiceEventKeys_1.default.MatchReady, { MatchId: createdMatch._id.toHexString() });
                        responseData = new net.HttpMessage(createdMatch._id.toHexString());
                        response
                            .status(httpStatusCodes.CREATED)
                            .json(responseData);
                    })
                        // error when creating the match
                        .catch(function (error) {
                        console.log(chalk_1.default.red("SHITSTORM: PendingMatch found & deleted BUT couldn't create the Match D:"));
                        responseData = new net.HttpMessage(null, "PendingMatch deleted but couldn't create the real Match! Reason: " + error.message);
                        response
                            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                            .json(responseData);
                    });
                })
                    // couldn't delete pending match
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
        _this._router.get("/newMatchSettings", _this._jwtValidator, function (request, response) {
            var dnms = null; // new game.MatchSettings();
            var responseData = new net.HttpMessage(game.MatchSettingsFactory.createDefaultSettings());
            response
                //.type("application/json")
                .status(httpStatusCodes.OK)
                .send(responseData);
        });
        _this._router.get("/:" + RoutingParamKeys_1.default.MatchId, _this._jwtValidator, function (request, response) {
            var responseData = null;
            var matchId = request.params[RoutingParamKeys_1.default.MatchId];
            Match.getModel()
                .findById(matchId)
                // .populate("FirstPlayerSide.PlayerId")
                // .populate("SecondPlayerSide.PlayerId")
                // .populate("InActionPlayerId")
                .then(function (match) {
                var matchDto = {
                    Id: match.id,
                    FirstPlayerId: match.FirstPlayerSide.PlayerId.toHexString(),
                    SecondPlayerId: match.SecondPlayerSide.PlayerId.toHexString(),
                    CreationDateTime: match.CreationDateTime,
                    Settings: {
                        BattleFieldWidth: match.Settings.BattleFieldWidth,
                        BattleFieldHeight: match.Settings.BattleFieldHeight,
                        MinShipsDistance: match.Settings.MinShipsDistance,
                        ShipTypeAvailabilities: match.Settings.AvailableShips.map(function (as) { return ({ ShipType: as.ShipType, Count: as.Count }); })
                    }
                };
                responseData = new net.HttpMessage(matchDto);
                response
                    .status(httpStatusCodes.OK)
                    .json(matchDto);
            })
                .catch(function (error) {
                responseData = new net.HttpMessage(null, error.message);
                response
                    .status(httpStatusCodes.NOT_FOUND)
                    .json(responseData);
            });
        });
        _this._router.post("/:" + RoutingParamKeys_1.default.MatchId, _this._jwtValidator, function () {
        });
        return _this;
    }
    GameRoutes.prototype.getPlayables = function (userId) {
        var _this = this;
        var playables = {};
        return this.getUsersPendingMatch(userId)
            .then(function (pendingMatch) {
            if (pendingMatch) {
                playables.PendingMatchId = pendingMatch.id;
            }
            return _this.getUsersPlayingMatch(userId)
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
    GameRoutes.prototype.getUsersPlayingMatch = function (userId) {
        var matchCriteria1 = {};
        matchCriteria1.FirstPlayerSide = {};
        matchCriteria1.FirstPlayerSide.PlayerId = userId;
        var matchCriteria2 = {};
        matchCriteria2.SecondPlayerSide = {};
        matchCriteria2.SecondPlayerSide.PlayerId = userId;
        return Match.getModel()
            // TODO: fix OR in criteria
            .findOne({ $or: [matchCriteria1, matchCriteria2] })
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
    };
    GameRoutes.prototype.getUsersPendingMatch = function (userId) {
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
    };
    GameRoutes.prototype.hasOpenMatches = function (userId) {
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
    };
    return GameRoutes;
}(RoutesBase_1.default));
exports.default = GameRoutes;
//# sourceMappingURL=GameRoutes.js.map