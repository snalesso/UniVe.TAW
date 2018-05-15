import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';

export default class WebSiteApp {

    private readonly ExpressApp: express.Application;
    public readonly Port: number;

    constructor(port: number) {
        if (!port) throw new RangeError(port + " is not a valid port number");
        this.Port = port;
        this.ExpressApp = express();
        this.ServerConfig();
        this.Routes();
    }

    public Listen() {
        this.ExpressApp.listen(this.Port, () => console.log("SiteServer listening on port " + this.Port + "!"));
    }

    private ServerConfig() {
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

        this.ExpressApp.get("*", (request: express.Request, response: express.Response) => {
            var paths = request.path.split(path.posix.sep);
            var fileName = paths[paths.length - 1] || "index";
            response.sendFile(fileName + ".html", { root: __dirname + "/public/views" + request.path });
        });
    }

    private Routes() {
        const router = express.Router();
        this.ExpressApp.use('/', router);
    }
}