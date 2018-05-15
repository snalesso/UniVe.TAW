"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//import * as mongodb from 'mongodb';
var UsersRouter_1 = require("./api/routers/UsersRouter");
var ApiServer = /** @class */ (function () {
    function ApiServer(port) {
        this.DbUrl = 'mongodb://localhost:27017/univetaw';
        if (!port)
            throw new RangeError(port + ' is not a valid port number');
        this.Port = port;
        this.ExpressApp = express();
        this.DbConfig();
        this.ServerConfig();
        this.Routes();
    }
    ApiServer.prototype.Start = function () {
        var _this = this;
        mongoose
            .connect(this.DbUrl
        //,undefined
        //,(error: mongodb.MongoError) => console.log("mongoose connection failed (.connect().catch)! Error: " + error.message)
        )
            .then(function (dbConnection) { return console.log("mongoose connected! (.connect().then(fullfilled))"); }, function (error) { return console.log("mongoose connection failed (.connect().then(rejected))! Error: " + error.message); })
            .then(function () { return _this.ExpressApp.listen(_this.Port, function () { return console.log('ApiServer listening on port ' + _this.Port + '!'); }); });
    };
    ApiServer.prototype.DbConfig = function () {
        // let db = mongoose.connection;
        // db.on('error', (error) => {
        //     console.log('Mongoose couldn\'t connect to ' + this.DbUrl + ' error: ' + JSON.stringify(error));
        // });
        // db.once('open', () => {
        //     console.log('Mongoose connected (once("open")) to ' + this.DbUrl);
        // });
    };
    ApiServer.prototype.ServerConfig = function () {
        this.ExpressApp.use(bodyParser.urlencoded({ extended: true }));
        this.ExpressApp.use(bodyParser.json());
        this.ExpressApp.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1632');
            // // Request methods you wish to allow
            // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // // Request headers you wish to allow
            // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            // // Set to true if you need the website to include cookies in the requests sent
            // // to the API (e.g. in case you use sessions)
            // res.setHeader('Access-Control-Allow-Credentials', 'true');
            // Pass to next layer of middleware
            next();
        });
    };
    ApiServer.prototype.Routes = function () {
        var router = express.Router();
        this.ExpressApp.use('/api', router);
        this.ExpressApp.use('/api/users', UsersRouter_1.default);
    };
    return ApiServer;
}());
exports.default = ApiServer;
//# sourceMappingURL=WebServiceApp.js.map