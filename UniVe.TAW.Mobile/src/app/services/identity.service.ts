import { Injectable } from '@angular/core';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/scripts/unive.taw.webservice/application/DTOs';
import * as net from '../../assets/scripts/unive.taw.webservice/infrastructure/net';
import * as game from '../../assets/scripts/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../assets/scripts/unive.taw.webservice/infrastructure/game.client';
import * as identity from '../../assets/scripts/unive.taw.webservice/infrastructure/identity';
import ServiceConstants from './ServiceConstants';

//import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
//import 'socket.io-client';
import * as ngxSocketIO from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {

  constructor(
    private readonly _http: ng_http.HttpClient,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket
  ) {
  }

  public getUserProfile(userId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/profile";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
      //et('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IUserProfile>>(endPoint, options);
  }

  public getRankings() {
    const endPoint = ServiceConstants.ServerAddress + "/users/rankings";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IUserRanking[]>>(endPoint, options);
  }

  public getUserPowers(userId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/powers";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IUserPowers>>(endPoint, options);
  }

  public getMatchHistory(userId: string = this._authService.LoggedUser.Id) {

    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/matchHistory";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IEndedMatchSummaryDto[]>>(endPoint, options);
  }

  public ban(userId: string, banDurationHours: number) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/ban";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.post<net.HttpMessage<Date>>(endPoint, { BanDurationHours: banDurationHours, UserId: userId } as DTOs.IUserBanRequest, options);
  }

  public unban(userId: string, banDurationHours: number) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/ban";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.post<net.HttpMessage<Date>>(endPoint, { BanDurationHours: 0, UserId: userId } as DTOs.IUserBanRequest, options);
  }

  public assignRole(userId: string, newRole: identity.UserRoles) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId + "/role";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.post<net.HttpMessage<identity.UserRoles>>(endPoint, { NewRole: newRole, UserId: userId } as DTOs.IRoleAssignmentRequestDto, options);
  }

  public deleteUser(userId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/users/" + userId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.delete<net.HttpMessage<boolean>>(endPoint, options);
  }
}