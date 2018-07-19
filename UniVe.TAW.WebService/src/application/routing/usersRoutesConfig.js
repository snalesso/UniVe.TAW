"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var httpStatusCodes = require("http-status-codes");
var net = require("../../infrastructure/net");
var identity = require("../../infrastructure/identity");
var User = require("../../domain/models/mongodb/mongoose/User");
var DTOs = require("../../application/DTOs");
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.post('/signup', function (request, response, next) {
    var responseData;
    var signupReq = request.body;
    // TODO: test all branches
    if (!signupReq) {
        response.status(httpStatusCodes.FORBIDDEN);
    }
    else {
        //let feawfw = signupReq as User.IMongoUser;
        var newUserSkel = {};
        newUserSkel.Username = signupReq.Username;
        newUserSkel.CountryId = signupReq.CountryId;
        newUserSkel.BirthDate = signupReq.BirthDate;
        newUserSkel.Roles = identity.UserRoles.Player;
        var newUser_1 = User.create(newUserSkel);
        newUser_1.setPassword(signupReq.Password);
        newUser_1.save()
            .then(function (result) {
            console.log("user created: " + JSON.stringify(result));
            responseData = new net.HttpMessage(true);
            response
                .status(httpStatusCodes.CREATED)
                .json(responseData);
        })
            .catch(function (error) {
            console.log("user creation failed: " + JSON.stringify(error));
            var aeuCriteria = {};
            aeuCriteria.Username = newUser_1.Username;
            User.getModel()
                .findOne(aeuCriteria)
                .then(function (takenUser) {
                var errMsg;
                var statusCode;
                switch (error.code) {
                    case 11000:
                        errMsg = "Username taken";
                        statusCode = httpStatusCodes.CONFLICT;
                        break;
                    default:
                        errMsg = "Uknown error";
                        statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
                        break;
                }
                responseData = new net.HttpMessage(false, errMsg);
                response
                    .status(statusCode)
                    .json(responseData);
            });
        });
    }
});
var userIdKey = "userId";
router.get("/:" + userIdKey, function (request, response, next) {
    var userId = request.params[userIdKey];
    var responseData = null;
    User.getModel()
        .findById(userId)
        .then(function (mongoUser) {
        var userDto = new DTOs.UserDto(mongoUser.id, mongoUser.Username, -1, mongoUser.CountryId);
        responseData = new net.HttpMessage(userDto);
        response
            .status(httpStatusCodes.OK)
            .json(responseData);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        response
            .status(httpStatusCodes.OK)
            .json(responseData);
    });
});
// TODO: add authentication and allow delete only to same user
router.delete("/:" + userIdKey, function (request, response, next) {
    var userId = request.params[userIdKey];
    var responseData = null;
    User.getModel()
        .findByIdAndRemove(userId, function (error, deletedUser) {
        if (error) {
            responseData = new net.HttpMessage(null, error.message);
            response
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        }
        else if (!deletedUser) {
            responseData = new net.HttpMessage(null, "User not found!");
            response
                .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
                .json(responseData);
        }
        else {
            responseData = new net.HttpMessage(true);
            response
                .status(httpStatusCodes.OK)
                .json(responseData);
        }
    });
});
exports.default = router;
//# sourceMappingURL=usersRoutesConfig.js.map