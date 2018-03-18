"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as path from "path";
var api_server_1 = require("./web-service/api-server");
var site_server_1 = require("./web-site/site-server");
var apiService = new api_server_1.default(1631);
var webSite = new site_server_1.default(1632);
webSite.Listen();
apiService.Listen();
//# sourceMappingURL=bootstrapper.js.map