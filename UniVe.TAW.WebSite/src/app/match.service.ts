import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as game from '../assets/scripts/unive.taw.framework/game';

@Injectable()
export class MatchService {

  constructor(private readonly http: HttpClient) {

  }

  public enemyBattleField: game.BattleField;

  public shoot(matchId: any, token: any, coord: game.Coord): Observable<game.BattleFieldCellStatus> {
    let action = {
      playerToken: token,
      coord: coord
    };
    return this.http.post<game.BattleFieldCellStatus>("http://localhost:1632/api/matches/" + matchId, action);
  }

}
