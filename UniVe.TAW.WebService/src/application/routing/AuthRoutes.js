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
var http = require("http");
var bodyParser = require("body-parser");
var httpStatusCodes = require("http-status-codes");
var passport = require("passport");
var passportHTTP = require("passport-http");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
var net = require("../../infrastructure/net");
var User = require("../../domain/models/mongodb/mongoose/User");
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
        passport.use(new passportHTTP.BasicStrategy(function (username, password, done) {
            console.log(chalk_1.default.yellow("Passport validating credentials ... "));
            var criteria = {};
            criteria.Username = username;
            User.getModel()
                .findOne(criteria, function (error, user) {
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
        }));
        // routes
        // TODO: check not already logged in
        _this._router.post('/login', passport.authenticate('basic', { session: false }), function (request, response) {
            var user = request.user;
            var statusCode;
            var errMsg;
            var responseData;
            if (!user) {
                console.log(chalk_1.default.red("Login failed!"));
                statusCode = httpStatusCodes.UNAUTHORIZED;
                responseData = new net.HttpMessage(null, "Invalid credentials");
            }
            else {
                statusCode = httpStatusCodes.OK;
                var jwtPayload = {
                    Id: user.id,
                    Username: user.Username
                };
                var token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
                    expiresIn: "7 days" // 60 * 60 * 24 * 7 // 1 week
                });
                console.log(chalk_1.default.green("Login SUCCESSFUL for ") + user.Username + " (id: " + user.id + ", token: " + token + ")");
                responseData = new net.HttpMessage(token);
            }
            response
                .status(statusCode)
                .json(responseData);
        });
        // TODO: check logged in
        // TODO: prevent requests from same account on different devices or set up so that multiple devices receive updates
        _this._router.post('/logout', _this._jwtValidator, function (request, response) {
            var jwtUser = request.user;
            var responseData;
            if (!jwtUser) {
                responseData = new net.HttpMessage(false, "You need to be logged in to log out.");
                response
                    .status(httpStatusCodes.BAD_REQUEST)
                    .json(responseData);
            }
            else {
                responseData = new net.HttpMessage(true);
                response
                    .status(httpStatusCodes.OK)
                    .json(responseData);
            }
        });
        return _this;
    }
    return GameRoutes;
}(RoutesBase_1.default));
exports.default = GameRoutes;
//# sourceMappingURL=AuthRoutes.js.map