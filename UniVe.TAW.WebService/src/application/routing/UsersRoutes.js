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
var httpStatusCodes = require("http-status-codes");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var identity = require("../../infrastructure/identity");
var User = require("../../domain/models/mongodb/mongoose/User");
var RoutingParamKeys_1 = require("./RoutingParamKeys");
var moment = require("moment");
var RoutesBase_1 = require("./RoutesBase");
var UsersRoutes = /** @class */ (function (_super) {
    __extends(UsersRoutes, _super);
    function UsersRoutes(socketIOServer) {
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
        _this._router.post('/signup', function (request, response, next) {
            var responseData;
            var signupReq = request.body;
            // TODO: test all branches
            if (!signupReq) {
                response.status(httpStatusCodes.FORBIDDEN);
            }
            else {
                //let feawfw = signupReq as User.IMongoUser;
                var newUserSkel = {};
                newUserSkel.Username = signupReq.Username.trim();
                newUserSkel.CountryId = signupReq.CountryId;
                newUserSkel.BirthDate = signupReq.BirthDate;
                newUserSkel.Roles = identity.UserRoles.Player;
                var newUser_1 = User.create(newUserSkel);
                newUser_1.setPassword(signupReq.Password);
                newUser_1.save()
                    .then(function (result) {
                    console.log("user created: " + JSON.stringify(result));
                    responseData = new net.HttpMessage(true);
                    response
                        .status(httpStatusCodes.CREATED)
                        .json(responseData);
                })
                    .catch(function (error) {
                    console.log("user creation failed: " + JSON.stringify(error));
                    var aeuCriteria = {};
                    aeuCriteria.Username = newUser_1.Username;
                    User.getModel()
                        .findOne(aeuCriteria)
                        .then(function (takenUser) {
                        var errMsg;
                        var statusCode;
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
        _this._router.get("/:" + RoutingParamKeys_1.default.UserId, _this._jwtValidator, function (request, response, next) {
            var userId = request.params[RoutingParamKeys_1.default.UserId];
            var responseData = null;
            User.getModel()
                .findById(userId)
                .then(function (mongoUser) {
                var userDto = {
                    Id: mongoUser.id,
                    Username: mongoUser.Username,
                    Age: moment().diff(mongoUser.BirthDate, "years", false),
                    CountryId: mongoUser.CountryId
                };
                responseData = new net.HttpMessage(userDto);
                response
                    .status(httpStatusCodes.OK)
                    .json(responseData);
            })
                .catch(function (error) {
                responseData = new net.HttpMessage(null, error.message);
                response
                    .status(httpStatusCodes.OK)
                    .json(responseData);
            });
        });
        // TODO: add authentication and allow delete only to same user
        _this._router.delete("/:" + RoutingParamKeys_1.default.UserId, _this._jwtValidator, function (request, response, next) {
            var userId = request.params[RoutingParamKeys_1.default.UserId];
            var responseData = null;
            User.getModel()
                .findByIdAndRemove(userId, function (error, deletedUser) {
                if (error) {
                    responseData = new net.HttpMessage(null, error.message);
                    response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }
                else if (!deletedUser) {
                    responseData = new net.HttpMessage(null, "User not found!");
                    response
                        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                        .json(responseData);
                }
                else {
                    responseData = new net.HttpMessage(true);
                    response
                        .status(httpStatusCodes.OK)
                        .json(responseData);
                }
            });
        });
        return _this;
    }
    return UsersRoutes;
}(RoutesBase_1.default));
exports.default = UsersRoutes;
//# sourceMappingURL=UsersRoutes.js.map