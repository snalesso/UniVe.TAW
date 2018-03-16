"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var User_1 = require("../models/User");
var UsersRouter = /** @class */ (function () {
    function UsersRouter() {
        this.router = express.Router();
        this.Routes();
    }
    UsersRouter.prototype.GetUsers = function (req, res) {
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
    UsersRouter.prototype.GetUser = function (req, res) {
        var userId = req.params["id"];
        res.json({ id: userId, username: "Daedalus" });
    };
    UsersRouter.prototype.Routes = function () {
        this.router.get('/', this.GetUsers);
        this.router.get('/:id', this.GetUser);
        // this.router.post('/', this.AddUser);
        // this.router.put('/:user', this.UpdateUser);
        // this.router.delete('/:id', this.DeleteUser);
    };
    return UsersRouter;
}());
exports.default = new UsersRouter().router;
//# sourceMappingURL=UsersRouter.js.map