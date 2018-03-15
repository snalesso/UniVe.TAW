"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var User_1 = require("../models/User");
var UsersRouter = /** @class */ (function () {
    function UsersRouter() {
        this.router = express.Router();
        this.routes();
    }
    UsersRouter.prototype.GetUser = function (req, res) {
        User_1.default
            .find({})
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.routes = function () {
        this.router.get('/users', this.GetUser);
    };
    return UsersRouter;
}());
exports.default = new UsersRouter().router;
//# sourceMappingURL=usersRouter.js.map