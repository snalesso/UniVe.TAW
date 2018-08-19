import { Injectable } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../assets/imported/unive.taw.webservice/infrastructure/game';
import Constants from './constants';

import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private readonly http: ng_http.HttpClient) { }

  public getJoinableMatches(accessToken: string): Observable<net.HttpMessage<DTOs.IJoinableMatchDto[]>> {
    const endPoint = Constants.ServerAddress + "/matches/joinables";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IJoinableMatchDto[]>>(endPoint, options);
  }

  public getNewMatchSettings(accessToken: string): Observable<net.HttpMessage<DTOs.IMatchSettingsDto>> {
    const endPoint = Constants.ServerAddress + "/matches/newMatchSettings";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IMatchSettingsDto>>(endPoint, options);
  }

  public getMatchInfo(accessToken: string, matchId: string): Observable<net.HttpMessage<DTOs.IMatchDto>> {
    const endPoint = Constants.ServerAddress + "/matches/" + matchId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IMatchDto>>(endPoint, options);
  }

  public createMatch(accessToken: string, fleetConfig: game.ShipPlacement[]): Observable<net.HttpMessage<string>> {
    const endPoint = Constants.ServerAddress + "/matches/create";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      })
    };

    return this.http.post<net.HttpMessage<string>>(endPoint, fleetConfig, options);
  }

  public joinMatch(accessToken: string, matchId: string, fleetConfig: game.ShipPlacement[]): Observable<net.HttpMessage<DTOs.IMatchDto>> {
    const endPoint = Constants.ServerAddress + "/matches/join" + matchId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      })
    };

    return this.http.post<net.HttpMessage<DTOs.IMatchDto>>(endPoint, fleetConfig, options);
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