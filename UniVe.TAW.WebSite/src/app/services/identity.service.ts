import { Injectable } from '@angular/core';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from './ServiceConstants';

//import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
//import 'socket.io-client';
import { SocketIOService } from './socket-io.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {

  constructor(
    private readonly _http: ng_http.HttpClient,
    private readonly _authService: AuthService,
    private readonly _socketIOService: SocketIOService
  ) {
  }

  public getUserProfile(userId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/users/profile/" + userId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IUserProfile>>(endPoint, options);
  }

  public getRankings() {
    const endPoint = ServiceConstants.ServerAddress + "/users/rankings";// /" + this._authService.LoggedUser.Id;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IUserRanking[]>>(endPoint, options);
  }

  public getDiocane() {
    const endPoint = ServiceConstants.ServerAddress + "/users/diocane";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<string>>(endPoint, options);
  }

  public getCazzo() {
    const endPoint = ServiceConstants.ServerAddress + "/users/cazzo";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
      //.set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<string>>(endPoint, options);
  }
}