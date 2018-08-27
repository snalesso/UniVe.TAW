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
    private readonly authService: AuthService) {
  }

  public getPlayables() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/playables";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " GET " + endPoint + " with token " + this.authService.Token);

    return this.http.get<net.HttpMessage<DTOs.IPlayablesDto>>(endPoint, options);
  }

  public createPendingMatch() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/createPendingMatch";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " POST " + endPoint + " with token " + this.authService.Token);

    return this.http.post<net.HttpMessage<string>>(endPoint, null, options);
  }

  public closePendingMatch(pendingMatchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/closePendingMatch/" + pendingMatchId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " POST " + endPoint + " with token " + this.authService.Token);

    return this.http.post<net.HttpMessage<boolean>>(endPoint, null, options);
  }

  public getNewMatchSettings() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/newMatchSettings";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " GET " + endPoint + " with token " + this.authService.Token);

    return this.http.get<net.HttpMessage<DTOs.IMatchSettingsDto>>(endPoint, options);
  }

  public joinPendingMatch(pendingMatchid: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/join/" + pendingMatchid;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " POST " + endPoint + " with token " + this.authService.Token);

    return this.http.post<net.HttpMessage<DTOs.IMatchDto>>(endPoint, null, options);
  }

  public configFleet(fleetConfig: game.ShipPlacement[]) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/create";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this.authService.Token)
    };

    console.log(this.authService.LoggedUser.Username + " POST " + endPoint + " with token " + this.authService.Token);

    return this.http.post<net.HttpMessage<string>>(endPoint, fleetConfig, options);
  }

  // public getMatchInfo(matchId: string) {//: Observable<net.HttpMessage<DTOs.IMatchDto>> {
  //   const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId;
  //   const options = {
  //     headers: new ng_http.HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + this.authService.Token
  //     })
  //   };

  //   return this.http.get<net.HttpMessage<DTOs.IMatchDto>>(endPoint, options);
  // }

}