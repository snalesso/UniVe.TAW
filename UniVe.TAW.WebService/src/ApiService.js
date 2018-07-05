"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//import * as mongodb from 'mongodb';
var httpStatusCodes = require("http-status-codes");
var UsersRouter_1 = require("./routing/UsersRouter");
var AuthRouter_1 = require("./routing/AuthRouter");
var MatchesRouter_1 = require("./routing/MatchesRouter");
var net = require("../libs/unive.taw.framework/net");
// TODO: rename into WebService?
var ApiService = /** @class */ (function () {
    function ApiService(port) {
        this._dbUrl = 'mongodb://localhost:27017/univetaw';
        if (!port)
            throw new RangeError(port + ' is not a valid port number');
        this.Port = port;
        this._expressApp = express();
    }
    ApiService.prototype.Start = function () {
        var _this = this;
        // TODO: get rid of magic string
        console.log("ApiService starting ...");
        // mongoose.connection.on("connected", () => {
        //     console.log("mongoose connected");
        // });
        // mongoose.connection.on("error", (error: mongodb.MongoError) => {
        //     console.log("mongoose connection error: ".red + error.message);
        // });
        mongoose.connection.on("disconnected", function (a) {
            console.log("mongoose disconnected");
        });
        mongoose.connection.on("SIGINT", function (a) {
            console.log("Recived SIGINT");
            mongoose.connection.close(function () {
                console.log('mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
        mongoose
            .connect(this._dbUrl)
            .then(function () {
            console.log(("mongoose connected to " + _this._dbUrl).green);
            _this.ConfigRoutes();
            _this.ConfigMiddlewares();
            _this._expressApp.listen(_this.Port, function () { return console.log(("ApiServer listening on http://localhost:" + _this.Port).green); });
        }, function (error) {
            console.log("mongoose connection failed! Reason: ".red + error.message);
        });
    };
    ApiService.prototype.ConfigMiddlewares = function () {
        console.log("Configuring middlewares ...");
        this._expressApp.use(bodyParser.urlencoded({ extended: true }));
        this._expressApp.use(bodyParser.json());
        this._expressApp.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:' + this.Port);
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
                return res.status(httpStatusCodes.OK).json({});
            }
            next();
        });
        // handles express-jwt invalid tokens
        this._expressApp.use(function (error, request, response, next) {
            console.log("UnauthorizedError (JWT): ".red + JSON.stringify(error.message));
            response
                .status(httpStatusCodes.UNAUTHORIZED)
                .json(new net.HttpMessage(null, error.message));
        });
        // handles unhandled errors
        this._expressApp.use(function (err, req, res, next) {
            console.log("Request error: ".red + JSON.stringify(err));
            res.status(err.statusCode || 500).json(err);
        });
        // handle request that point to invalid endpoints
        // this._expressApp.use((req, res, next) => {
        //     res.status(404).json({ statusCode: 404, error: true, errormessage: "Invalid endpoint " + req.url });
        // });
    };
    ApiService.prototype.ConfigRoutes = function () {
        console.log("Configuring routes ...");
        this._expressApp.use('/users', UsersRouter_1.default);
        this._expressApp.use('/auth', AuthRouter_1.default);
        this._expressApp.use('/matches', MatchesRouter_1.default);
    };
    return ApiService;
}());
exports.default = ApiService;
//# sourceMappingURL=ApiService.js.map