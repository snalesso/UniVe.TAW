"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var usersRouter_1 = require("./api/routers/usersRouter");
var ApiServer = /** @class */ (function () {
    function ApiServer(port) {
        if (port === void 0) { port = 1631; }
        this.Port = port;
        this.ExpressApp = express();
        this.DbConfig();
        this.ServerConfig();
    }
    ApiServer.prototype.DbConfig = function () {
        mongoose.connect('mongodb://localhost/univetaw', function (error) {
            console.log(JSON.stringify(error));
        });
        var db = mongoose.connection;
        db.once('open', function () {
            console.log('Mongoose: Siamo dentro!');
        });
    };
    ApiServer.prototype.ServerConfig = function () {
        this.ExpressApp.use(bodyParser.urlencoded({ extended: true }));
        this.ExpressApp.use(bodyParser.json());
    };
    ApiServer.prototype.Routes = function () {
        var router = express.Router();
        this.ExpressApp.use('/api', router);
        this.ExpressApp.use('/api/users', usersRouter_1.default);
    };
    return ApiServer;
}());
exports.default = new ApiServer().ExpressApp;
//# sourceMappingURL=api-server.js.map