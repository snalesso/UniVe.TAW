import * as express from "express";
import * as bodyParser from "body-parser";
import WebServiceApp from './WebServiceApp';

const webServiceApp = new WebServiceApp(1632);

webServiceApp.Start();