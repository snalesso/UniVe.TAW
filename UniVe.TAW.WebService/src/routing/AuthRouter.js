"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var jwt = require("jsonwebtoken");
var httpStatusCodes = require("http-status-codes");
var net = require("../../libs/unive.taw.framework/net");
var User = require("../domain/models/mongodb/mongoose/User");
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.post('/login', function (req, res, next) {
    var lc = req.body;
    var statusCode;
    var errMsg = null;
    var responseData;
    if (!lc.Username || lc.Username.length <= 0)
        errMsg = "Username missing";
    if (!lc.Password || lc.Password.length <= 0)
        errMsg = "Password missing";
    var criteria = {};
    criteria.Username = lc.Username;
    User.GetModel()
        .findOne(criteria)
        .then(function (user) {
        var InvalidCredentialsErrorMessage = "Invalid credentials";
        if (!user) {
            statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
            responseData = new net.HttpMessage(null, InvalidCredentialsErrorMessage);
        }
        else if (user.ValidatePassword(lc.Password)) {
            statusCode = httpStatusCodes.OK;
            var jwtPayload = {
                Id: JSON.stringify(user._id),
                Username: user.Username
            };
            var token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
                expiresIn: 60 * 60
            });
            responseData = new net.HttpMessage(token);
            console.log("LOGIN SUCCESSFUL for " + user.Username + " (id: " + user._id + ")");
        }
        else {
            statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
            errMsg = InvalidCredentialsErrorMessage;
        }
        res
            .status(statusCode)
            .json(responseData);
    })
        .catch(function (error) {
        console.log("LOGIN FAILED: " + error.message);
        statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
        responseData = new net.HttpMessage(null, error.message);
        res
            .status(statusCode)
            .json(responseData);
    });
});
router.post('/logout', function (req, res, next) {
});
exports.default = router;
//# sourceMappingURL=AuthRouter.js.map