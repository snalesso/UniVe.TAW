"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Match = require("../models/Match");
var MatchesRouter = /** @class */ (function () {
    function MatchesRouter() {
        this.router = express.Router();
        this.configRoutes();
    }
    MatchesRouter.prototype.create = function (req, res, next) {
        var challengerToken = req.params["challengerToken"];
        var newMatch = Match.create({});
        Match.getModel()
            .create(newMatch)
            .then(function (data) {
            var status = res.statusCode;
            res.json({ status: status, data: data });
        })
            .catch(function (error) {
            var status = res.statusCode;
            res.json({ status: status, error: error });
        });
    };
    MatchesRouter.prototype.executeAction = function (req, res, next) {
    };
    MatchesRouter.prototype.configRoutes = function () {
        this.router.post('/:challengerToken', this.create);
        this.router.put('/:matchId', this.executeAction);
        //this.router.delete('/:matchId', this.surrend);
    };
    return MatchesRouter;
}());
exports.default = new MatchesRouter().router;
//# sourceMappingURL=MatchesRouter.js.map