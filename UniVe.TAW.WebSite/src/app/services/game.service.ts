import { Injectable } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import Constants from './constants';

import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private readonly http: ng_http.HttpClient) { }

  public getJoinableMatches(accessToken: DTOs.IUserJWTData): Observable<net.HttpMessage<DTOs.IPendingMatchDto[]>> {
    const endPoint = Constants.ServerAddress + "/matches/joinables";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem(Constants.AccessTokenKey)
      })
    };

    return this.http.get<net.HttpMessage<DTOs.IPendingMatchDto[]>>(endPoint, options);
  }

}