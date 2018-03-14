﻿import * as express from "express";
import * as path from "path";

const ServerListenPort = 16344;
const app = express();

console.log("__dirname: " + __dirname);

//app.use(express.static(__dirname + "/public"));
app.use("/", express.static(__dirname + "/public"));
app.use("/styles", express.static(__dirname + "/public/styles"));
app.use("/scripts", express.static(__dirname + "/public/scripts"));
//app.use("/views", express.static(__dirname + "/public/views"));

app.get("/*", (request: express.Request, response: express.Response) => {
    response.sendFile("index.html", { root: __dirname + "/public/views" + request.path });
    // response.send("Hello!");
});

app.listen(ServerListenPort, () => console.log("Listening on port " + ServerListenPort + "!"));



// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
// app.use(express.static(__dirname + '/views'));
// app.post("/SendMessage", (request: express.Request, response: express.Response) => {
//     response.send("SendMessage: " + JSON.stringify(request["body"]));
// });
// app.post("/Signup", (request: express.Request, response: express.Response) => {
//     response.send("Signup: " + JSON.stringify(request["body"]));
// });