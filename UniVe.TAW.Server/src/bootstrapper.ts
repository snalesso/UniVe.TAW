import * as express from "express";
import * as bodyParser from "body-parser";
//import * as path from "path";
import WebServiceApp from './webService/WebServiceApp';
import WebSiteApp from './webSite/WebSiteApp';

const webServiceApp = new WebServiceApp(1632);
const WebSiteApp = new WebSiteApp(1632);

WebSiteApp.Listen();
webServiceApp.Listen();