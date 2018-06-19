import * as express from "express";
import * as bodyParser from "body-parser";
import ApiService from './ApiService';

const webServiceApp = new ApiService(1632);

webServiceApp.Start();