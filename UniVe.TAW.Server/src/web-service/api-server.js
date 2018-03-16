"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var UsersRouter_1 = require("./api/routers/UsersRouter");
var ApiServer = /** @class */ (function () {
    function ApiServer(port) {
        if (!port)
            throw new RangeError(port + " is not a valid port number");
        this.Port = port;
        this.ExpressApp = express();
        this.DbConfig();
        this.ServerConfig();
        this.Routes();
    }
    ApiServer.prototype.Listen = function () {
        var _this = this;
        this.ExpressApp.listen(this.Port, function () { return console.log("ApiServer listening on port " + _this.Port + "!"); });
    };
    ApiServer.prototype.DbConfig = function () {
        mongoose.connect('mongodb://localhost:27017/univetaw');
        var db = mongoose.connection;
        db.on('error', function (error) {
            console.log("Mongoose connect error: " + JSON.stringify(error));
        });
        db.once('open', function () {
            console.log('Mongoose on-open: Siamo dentro!');
        });
    };
    ApiServer.prototype.ServerConfig = function () {
        this.ExpressApp.use(bodyParser.urlencoded({ extended: true }));
        this.ExpressApp.use(bodyParser.json());
    };
    ApiServer.prototype.Routes = function () {
        var router = express.Router();
        this.ExpressApp.use('/api', router);
        this.ExpressApp.use('/api/users', UsersRouter_1.default);
    };
    return ApiServer;
}());
exports.default = ApiServer;
//# sourceMappingURL=api-server.js.map