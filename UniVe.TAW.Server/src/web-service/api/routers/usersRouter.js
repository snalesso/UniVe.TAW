"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var User_1 = require("../models/User");
//import * as auth from '../../../libs/UniVe.TAW.Framework/auth';
var UsersRouter = /** @class */ (function () {
    function UsersRouter() {
        this.router = express.Router();
        this.Routes();
    }
    UsersRouter.prototype.GetUsers = function (req, res) {
        User_1.default
            .find()
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.GetUser = function (req, res) {
        var userId = req.params["id"];
        User_1.default
            .findById(userId)
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.AddUser = function (req, res) {
        var sr = req.body;
        var newUser = new User_1.default({ Username: sr.Username, Password: sr.Password, BirthDate: sr.BirthDate, Country: sr.Country });
        newUser
            .save()
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.UpdateUser = function (req, res) {
        var sr = req.body;
        var propsToUpdate = { Username: "sr.Username", Password: sr.Password, BirthDate: sr.BirthDate, Country: sr.Country };
        User_1.default
            .findByIdAndUpdate(req.params["id"], propsToUpdate)
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.Routes = function () {
        this.router.get('/', this.GetUsers);
        this.router.get('/:id', this.GetUser);
        this.router.post('/', this.AddUser);
        this.router.put('/:id', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    };
    return UsersRouter;
}());
exports.default = new UsersRouter().router;
//# sourceMappingURL=UsersRouter.js.map