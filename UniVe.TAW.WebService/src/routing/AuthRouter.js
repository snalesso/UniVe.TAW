"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var httpStatusCodes = require("http-status-codes");
var passport = require("passport");
var passportHTTP = require("passport-http");
var jwt = require("jsonwebtoken");
var User = require("../domain/models/mongodb/mongoose/User");
var net = require("../../libs/unive.taw.framework/net");
var router = express.Router();
// middlewares
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
passport.use(new passportHTTP.BasicStrategy(function (username, password, done) {
    // Delegate function we provide to passport middleware
    // to verify user credentials
    console.log("New login attempt from ".green + username);
    var criteria = {};
    criteria.Username = username;
    User.GetModel()
        .findOne(criteria, function (error, user) {
        if (error) {
            return done({ statusCode: 500, error: true, errormessage: error });
        }
        if (!user) {
            return done({ statusCode: 500, error: true, errormessage: "Invalid user" });
        }
        if (user.ValidatePassword(password)) {
            return done(null, user);
        }
        return done({ statusCode: 500, error: true, errormessage: "Invalid password" });
    });
}));
// routes
router.post('/login', passport.authenticate('basic', { session: false }), function (req, res) {
    var lc = req.body;
    var statusCode;
    var errMsg;
    var responseData;
    if (!lc.Username || lc.Username.length <= 0)
        errMsg = "Username missing";
    if (!lc.Password || lc.Password.length <= 0)
        errMsg = "Password missing";
    var criteria = {};
    criteria.Username = lc.Username;
    // TODO: use req.user instead (passed by passport)
    User.GetModel()
        .findOne(criteria)
        .then(function (user) {
        // TODO: create DB dictionary
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
router.post('/logout', function () { });
exports.default = router;
//# sourceMappingURL=AuthRouter.js.map