import { Injectable } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../assets/imported/unive.taw.webservice/infrastructure/game';
import ServiceConstants from './ServiceConstants';

import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private readonly http: ng_http.HttpClient,
    private readonly authService: AuthService) { }

  public getJoinableMatches() {//: Observable<net.HttpMessage<DTOs.IJoinableMatchDto[]>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/joinables";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IJoinableMatchDto[]>>(endPoint, options);
  }

  public getNewMatchSettings() {//: Observable<net.HttpMessage<DTOs.IMatchSettingsDto>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/newMatchSettings";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IMatchSettingsDto>>(endPoint, options);
  }

  public getMatchInfo(matchId: string) {//: Observable<net.HttpMessage<DTOs.IMatchDto>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IMatchDto>>(endPoint, options);
  }

  public createMatch(fleetConfig: game.ShipPlacement[]) {//: Observable<net.HttpMessage<string>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/create";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.post<net.HttpMessage<string>>(endPoint, fleetConfig, options);
  }

  public joinMatch(joinableMatchId: string) {//: Observable<net.HttpMessage<DTOs.IMatchDto>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/join" + joinableMatchId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.post<net.HttpMessage<DTOs.IMatchDto>>(endPoint, options);
  }

  public getPlayables() {//: Observable<net.HttpMessage<DTOs.IPlayablesDto>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/playables";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IPlayablesDto>>(endPoint, options);
  }

  public waitOpponent() {//: Observable<net.HttpMessage<DTOs.IPendingMatchDto>> {
    const endPoint = ServiceConstants.ServerAddress + "/matches/waitOpponent";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authService.Token
      })
    };

    return this.http.post<net.HttpMessage<DTOs.IPendingMatchDto>>(endPoint, options);
  }

  // public getSta(accessToken: string): Observable<net.HttpMessage<game.ShipTypeAvailability>> {
  //   const endPoint = Constants.ServerAddress + "/matches/sta";
  //   const options = {
  //     headers: new ng_http.HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + accessToken
  //     })
  //   };

  //   return this.http.get<net.HttpMessage<DTOs.IShipTypeAvailabilityDto>>(endPoint, options);
  // }

}