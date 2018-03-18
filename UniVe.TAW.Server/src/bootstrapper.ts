import * as express from "express";
import * as bodyParser from "body-parser";
//import * as path from "path";
import ApiServer from './web-service/api-server';
import SiteServer from './web-site/site-server';

const apiService = new ApiServer(1631);
const webSite = new SiteServer(1632);

webSite.Listen();
apiService.Listen();