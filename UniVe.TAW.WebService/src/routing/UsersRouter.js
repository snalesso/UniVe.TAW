"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var httpStatusCodes = require("http-status-codes");
var DTOs = require("../DTOs/DTOs");
var net = require("../../libs/unive.taw.framework/net");
var utils = require("../../libs/unive.taw.framework/utils");
var User = require("../domain/models/mongodb/mongoose/User");
var user_enums = require("../domain/enums/user");
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.post('/signup', function (req, res, next) {
    var responseData;
    var signupReq = req.body;
    // TODO: test all branches
    if (!signupReq) {
        res.status(httpStatusCodes.FORBIDDEN);
    }
    else {
        //let feawfw = signupReq as User.IMongoUser;
        var newUserSkel = {};
        newUserSkel.Username = signupReq.Username;
        newUserSkel.CountryId = signupReq.CountryId;
        newUserSkel.BirthDate = signupReq.BirthDate;
        newUserSkel.Roles = user_enums.UserRoles.Player;
        var newUser = User.Create(newUserSkel);
        newUser.SetPassword(signupReq.Password);
        newUser.save()
            .then(function (result) {
            console.log("user created: " + JSON.stringify(result));
            responseData = new net.HttpMessage(true);
            res
                .status(httpStatusCodes.CREATED)
                .json(responseData);
        })
            .catch(function (error) {
            console.log("user creation failed: " + JSON.stringify(error));
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
            res
                .status(statusCode)
                .json(responseData);
        });
    }
});
router.get('/:userId', function (req, res, next) {
    var userId = req.params["userId"];
    var responseData = null;
    User.GetModel()
        .findById(userId)
        .then(function (mongoUser) {
        var userDto = new DTOs.UserDto(JSON.stringify(mongoUser._id), mongoUser.Username, utils.GetAge(mongoUser.BirthDate), mongoUser.CountryId);
        responseData = new net.HttpMessage(userDto);
        res
            .status(httpStatusCodes.OK)
            .json(responseData);
    })
        .catch(function (error) {
        responseData = new net.HttpMessage(null, error.message);
        res
            .status(httpStatusCodes.OK)
            .json(responseData);
    });
});
exports.default = router;
//# sourceMappingURL=UsersRouter.js.map