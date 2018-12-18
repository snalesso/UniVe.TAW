import { Injectable } from '@angular/core';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/unive.taw.webservice/application/DTOs';
import * as net from '../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from './ServiceConstants';

import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
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
    const endPoint = ServiceConstants.ServerAddress + "/game/playables";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IPlayablesDto>>(endPoint, options);
  }

  public createPendingMatch() {
    const endPoint = ServiceConstants.ServerAddress + "/game/pendingMatches";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<string>>(endPoint, null, options);
  }

  public closePendingMatch(pendingMatchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/pendingMatches/" + pendingMatchId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.delete<net.HttpMessage<boolean>>(endPoint, options);
  }

  public joinPendingMatch(pendingMatchid: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/pendingMatches/" + pendingMatchid;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.put<net.HttpMessage<string>>(endPoint, null, options);
  }

  public getMatchStatus(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId;
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IOwnSideMatchStatus>>(endPoint, options);
  }

  public getMatchConfigStatus(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId + "/config";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IMatchConfigStatus>>(endPoint, options);
  }

  public configMatch(matchId: string, fleetConfig: game.ShipPlacement[]) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId + "/config";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.post<net.HttpMessage<boolean>>(endPoint, fleetConfig, options);
  }

  public getOwnTurnInfo(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId + "/ownTurnInfo";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IOwnTurnInfoDto>>(endPoint, options);
  }

  public singleShot(matchId: string, singleShot: game.ISingleShotMatchAction) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId + "/singleShot";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.post<net.HttpMessage<DTOs.IAttackResultDto>>(endPoint, singleShot, options);
  }

  public getEnemyTurnInfo(matchId: string) {
    const endPoint = ServiceConstants.ServerAddress + "/game/matches/" + matchId + "/enemyTurnInfo";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.Token
      })
    };

    return this._http.get<net.HttpMessage<DTOs.IEnemyTurnInfoDto>>(endPoint, options);
  }

}