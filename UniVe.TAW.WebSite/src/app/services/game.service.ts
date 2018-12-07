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
import * as ngxSocketIO from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private readonly _http: ng_http.HttpClient,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket
  ) {
  }

  public getPlayables() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/playables";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IPlayablesDto>>(endPoint, options);
  }

  public createPendingMatch() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/createPendingMatch";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<string>>(endPoint, null, options);
  }

  public closePendingMatch(pendingMatchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/closePendingMatch/" + pendingMatchId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<boolean>>(endPoint, null, options);
  }

  public getNewMatchSettings() {
    const endPoint = ServiceConstants.ServerAddress + "/matches/newMatchSettings";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<game.IMatchSettings>>(endPoint, options);
  }

  public joinPendingMatch(pendingMatchid: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/joinPendingMatch/" + pendingMatchid;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<string>>(endPoint, null, options);
  }

  // TODO: rename
  // TODO: return only bool instead of DTOs.IOwnSideMatchConfigStatus
  public configMatch(matchId: string, fleetConfig: game.ShipPlacement[]) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/config";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<DTOs.IOwnSideMatchConfigStatus>>(endPoint, fleetConfig, options);
  }

  public getMatchConfigStatus(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/config";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IOwnSideMatchConfigStatus>>(endPoint, options);
  }

  public getOwnTurnInfo(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/ownTurnInfo";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IOwnTurnInfoDto>>(endPoint, options);
  }

  public getOwnSideMatchStatus(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/ownSideMatchStatus";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IOwnSideMatchStatus>>(endPoint, options);
  }

  public singleShot(matchId: string, singleShot: game.ISingleShotMatchAction) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/singleShot";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.post<net.HttpMessage<DTOs.IAttackResultDto>>(endPoint, singleShot, options);
  }

  public getEnemyTurnInfo(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/matches/" + matchId + "/enemyTurnInfo";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IEnemyTurnInfoDto>>(endPoint, options);
  }

}