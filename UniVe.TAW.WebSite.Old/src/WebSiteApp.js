"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var WebSiteApp = /** @class */ (function () {
    function WebSiteApp(port) {
        if (!port)
            throw new RangeError(port + " is not a valid port number");
        this.Port = port;
        this.ExpressApp = express();
        this.ServerConfig();
        this.Routes();
    }
    WebSiteApp.prototype.Listen = function () {
        var _this = this;
        this.ExpressApp.listen(this.Port, function () { return console.log("SiteServer listening on port " + _this.Port + "!"); });
    };
    WebSiteApp.prototype.ServerConfig = function () {
        this.ExpressApp.use(bodyParser.urlencoded({ extended: true }));
        this.ExpressApp.use(bodyParser.json());
        this.ExpressApp.use("/", express.static(__dirname + "/public"));
        this.ExpressApp.use("/styles", express.static(__dirname + "/public/styles"));
        // scripts
        this.ExpressApp.use("/scripts", express.static(__dirname + "/public/scripts"));
        this.ExpressApp.use("/scripts/jquery", express.static("D:/Dev/Repos/GitHub/snalesso/UniVe.TAW/UniVe.TAW.Server/node_modules/jquery/dist"));
        this.ExpressApp.use("/scripts/UniVe.TAW.Framework", express.static("D:/Dev/Repos/GitHub/snalesso/UniVe.TAW/UniVe.TAW.Server/src/libs/UniVe.TAW.Framework"));
        // views
        this.ExpressApp.use("/views", express.static(__dirname + "/public/views"));
        this.ExpressApp.get("*", function (request, response) {
            var paths = request.path.split(path.posix.sep);
            var fileName = paths[paths.length - 1] || "index";
            response.sendFile(fileName + ".html", { root: __dirname + "/public/views" + request.path });
        });
    };
    WebSiteApp.prototype.Routes = function () {
        var router = express.Router();
        this.ExpressApp.use('/', router);
    };
    return WebSiteApp;
}());
exports.default = WebSiteApp;
//# sourceMappingURL=WebSiteApp.js.map