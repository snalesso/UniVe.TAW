import { Injectable } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import Constants from './constants';
import * as utils from '../../assets/imported/unive.taw.webservice/infrastructure/utils';

import * as $ from 'jquery';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DummyGameService {

  constructor() { }

  public getJoinableMatches(params: any): Observable<net.HttpMessage<DTOs.IJoinableMatchDto[]>> {
    return of(new net.HttpMessage(this.getFakeJoinableMatches(10)));
  }

  private getFakeJoinableMatches(count: number): DTOs.IJoinableMatchDto[] {
    let fakeMatches: DTOs.IJoinableMatchDto[] = [];
    const countriesCount = Object.keys(identity.Country).filter(countryName => !isNaN(identity.Country[countryName])).length;

    for (let i = 1; i <= count; i++) {
      let rci =
        fakeMatches.push({
          Id: "MatchId #" + i,
          Creator: {
            Id: "Match creator id #" + i,
            Username: "Creator of match #" + i,
            CountryId: utils.getRandomInt(0, countriesCount),
            Age: utils.getRandomInt(3, 100)
          }
        });
    }

    return fakeMatches;
  }
}
