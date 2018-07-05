"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
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
    console.log("Passport validating credentials ... ".yellow);
    var criteria = {};
    criteria.Username = username;
    User.getModel()
        .findOne(criteria, function (error, user) {
        if (error) {
            return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: error });
        }
        if (!user) {
            return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: "Invalid user" });
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done({ statusCode: http.STATUS_CODES.INTERNAL_SERVER_ERROR, error: true, errormessage: "Invalid password" });
    });
}));
// routes
router.post('/login', passport.authenticate('basic', { session: false }), function (request, response) {
    var user = request.user;
    var statusCode;
    var errMsg;
    var responseData;
    if (!user) {
        console.log("Login failed!".red);
        statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
        responseData = new net.HttpMessage(null, "Invalid credentials");
    }
    else {
        console.log("Login successful for ".green + user.Username + " (id: " + user.id + ")");
        statusCode = httpStatusCodes.OK;
        var jwtPayload = {
            Id: user.id,
            Username: user.Username
        };
        var token = jwt.sign(jwtPayload, process.env.JWT_KEY, {
            expiresIn: 60 * 60 // 60 mins
        });
        responseData = new net.HttpMessage(token);
    }
    response
        .status(statusCode)
        .json(responseData);
});
router.post('/logout', function () { });
exports.default = router;
//# sourceMappingURL=AuthRouter.js.map