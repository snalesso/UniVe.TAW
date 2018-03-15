"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var api_server_1 = require("./web-service/api-server");
var WebServicePort = 1631;
var WebSitePort = 1632;
var app = express();
// plugins
app.use(bodyParser.json());
// routing
app.use("/", express.static(__dirname + "/web-site/public"));
app.use("/styles", express.static(__dirname + "/web-site/public/styles"));
app.use("/scripts", express.static(__dirname + "/web-site/public/scripts"));
app.use("/views", express.static(__dirname + "/web-site/public/views"));
app.get("*", function (request, response) {
    var paths = request.path.split(path.posix.sep);
    var fileName = paths[paths.length - 1] || "index";
    response.sendFile(fileName + ".html", { root: __dirname + "/web-site/public/views" + request.path });
});
// apis
// app.post("/SendMessage", (request: express.Request, response: express.Response) => {
//     response.send("SendMessage: " + JSON.stringify(request["body"]));
// });
// app.post("/Signup", (request: express.Request, response: express.Response) => {
//     response.send("Signup: " + JSON.stringify(request["body"]));
// });
// web site
// start
app.listen(WebSitePort, function () { return console.log("Web site listening on port " + WebSitePort + "!"); });
// API
api_server_1.default.listen(WebServicePort, function () { return console.log("Web service listening on port " + WebServicePort + "!"); });
//# sourceMappingURL=server.js.map