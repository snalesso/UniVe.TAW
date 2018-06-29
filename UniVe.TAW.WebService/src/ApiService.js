"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//import * as mongodb from 'mongodb';
var httpStatusCodes = require("http-status-codes");
var UsersRouter_1 = require("./routes/UsersRouter");
var AuthRouter_1 = require("./routes/AuthRouter");
var MatchesRouter_1 = require("./routes/MatchesRouter");
var ApiService = /** @class */ (function () {
    function ApiService(port) {
        this._dbUrl = 'mongodb://localhost:27017/univetaw';
        if (!port)
            throw new RangeError(port + ' is not a valid port number');
        this.Port = port;
        this._expressApp = express();
        this.ConfigRoutes();
    }
    ApiService.prototype.Start = function () {
        var _this = this;
        console.log("Server starting!");
        mongoose
            .connect(this._dbUrl
        //,undefined
        //,(error: mongodb.MongoError) => console.log("mongoose connection failed (.connect().catch)! Error: " + error.message)
        )
            .then(function (dbConnection) { return console.log("Mongoose connected! (.connect().then(fullfilled))"); }, function (error) { return console.log("Mongoose connection failed (.connect().then(rejected))! Error: " + error.message); })
            .then(function () { return _this.ServerConfig(); }, function (reason) { return console.log("Error during serverconfig: " + reason); })
            .then(function () {
            _this._expressApp.listen(_this.Port, function () { return console.log('ApiServer listening on http://localhost:' + _this.Port + '!'); });
            //throw new Error("error thrown manually alongside express.listen");
        }, function (reason) { return console.log("Error during expressapp listen: " + reason); });
    };
    ApiService.prototype.ServerConfig = function () {
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
        // // handle unresolved requests (404)
        // this._expressApp.use((req, res, next) => {
        //     res.status(404).json({ error: true, errormessage: "Invalid endpoint" });
        // });
        //throw new Error("fefakwpoefkaew");
    };
    ApiService.prototype.ConfigRoutes = function () {
        this._expressApp.use('/users', UsersRouter_1.default);
        this._expressApp.use('/auth', AuthRouter_1.default);
        this._expressApp.use('/matches', MatchesRouter_1.default);
    };
    return ApiService;
}());
exports.default = ApiService;
//# sourceMappingURL=ApiService.js.map