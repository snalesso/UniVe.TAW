"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as path from "path";
var WebServiceApp_1 = require("./webService/WebServiceApp");
var webServiceApp = new WebServiceApp_1.default(1631);
var WebSiteApp = new WebSiteApp(1632);
WebSiteApp.Listen();
webServiceApp.Listen();
//# sourceMappingURL=bootstrapper.js.map