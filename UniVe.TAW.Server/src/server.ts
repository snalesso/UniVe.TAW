import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import ApiServer from './web-service/api-server';
import apiServer from "./web-service/api-server";

const WebServicePort = 1631;
const WebSitePort = 1632;
const app = express();

// plugins
app.use(bodyParser.json());

// routing
app.use("/", express.static(__dirname + "/web-site/public"));
app.use("/styles", express.static(__dirname + "/web-site/public/styles"));
app.use("/scripts", express.static(__dirname + "/web-site/public/scripts"));
app.use("/views", express.static(__dirname + "/web-site/public/views"));

app.get("*", (request: express.Request, response: express.Response) => {
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
app.listen(WebSitePort, () => console.log("Web site listening on port " + WebSitePort + "!"));

// API

ApiServer.listen(WebServicePort, () => console.log("Web service listening on port " + WebServicePort + "!"));