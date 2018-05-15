"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var User = require("../models/User");
var auth = require("../../libs/unive.taw.framework/auth");
var net = require("../../libs/unive.taw.framework/net");
var UsersRouter = /** @class */ (function () {
    function UsersRouter() {
        this.Router = express.Router();
        this.Routes();
    }
    UsersRouter.prototype.GetUsers = function (req, res) {
        User.getModel()
            .find()
            .then(function (mongoUsers) {
            var users = mongoUsers.map(function (mu) {
                var id = JSON.stringify(mu._id);
                var us = mu['Username'];
                var p = mu['Password'];
                var bds = mu['BirthDate'];
                var bd = new Date(bds);
                var ci = mu['CountryId'] || 0;
                var u = new auth.UserDto(id, us, p, bd, ci);
                return u;
            });
            var status = res.statusCode;
            var hr = new net.HttpResponse(users);
            res.json(hr);
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    UsersRouter.prototype.GetUser = function (req, res) {
        var userId = req.params["id"];
        User.getModel()
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
        var newUser = User.createUser({ Username: sr.Username, Password: sr.Password, BirthDate: sr.BirthDate, CountryId: sr.CountryId });
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
        var propsToUpdate = { Username: "sr.Username", Password: sr.Password, BirthDate: sr.BirthDate, CountryId: sr.CountryId };
        User.getModel()
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
        this.Router.get('/', this.GetUsers);
        this.Router.get('/:id', this.GetUser);
        this.Router.post('/', this.AddUser);
        this.Router.put('/:id', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    };
    return UsersRouter;
}());
exports.default = new UsersRouter().Router;
//# sourceMappingURL=UsersRouter.js.map