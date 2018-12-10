import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/scripts/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/scripts/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/scripts/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/scripts/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../../assets/scripts/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/scripts/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-enemy-turn-controller',
  templateUrl: './enemy-turn-controller.component.html',
  styleUrls: ['./enemy-turn-controller.component.scss']
})
export class EnemyTurnControllerComponent implements OnInit, OnDestroy {

  private readonly _matchId: string;

  private _enemyTurnInfo: DTOs.IEnemyTurnInfoDto;
  //private _isRebuildingCells: boolean = true;
  private _youGotShotEvent: string;
  //private _matchEndedEvent: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  public get BattleFieldWidth(): number { return (this._enemyTurnInfo && this._enemyTurnInfo.MatchSettings) ? this._enemyTurnInfo.MatchSettings.BattleFieldWidth : 0; }

  //private _gridCells: game_client.IOwnBattleFieldCell[][];
  public get Cells() {

    if (!this._enemyTurnInfo || !this._enemyTurnInfo.OwnField)
      return null;

    return this._enemyTurnInfo.OwnField;
  }

  public get Username() { return this._authService.IsLogged ? this._authService.LoggedUser.Username : "My field"; }

  private get IsEnemyTurn(): boolean { return this._enemyTurnInfo != null ? this._enemyTurnInfo.OwnsMove : false; }

  // private _winnerId: string;
  // public get WinnerId(): string { return this._winnerId; }

  public getCellStatusUIClass(cell: game_client.IOwnBattleFieldCell): string {

    let uiClass = "unknown";

    if (cell.Status == game_client.OwnBattleFieldCellStatus.Hit) {
      if (cell.ShipType == game.ShipType.NoShip) {
        uiClass = "water";
      }
      else {
        uiClass = "hitship";
      }
    } else if (cell.Status == game_client.OwnBattleFieldCellStatus.Untouched) {
      if (cell.ShipType == game.ShipType.NoShip) {
        uiClass = "unknown";
      }
      else {
        uiClass = "ship";
      }
    }

    return ("bf-grid-cell-" + uiClass).toLowerCase();
  }

  ngOnInit() {

    this._gameService
      .getEnemyTurnInfo(this._matchId)
      .subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("The server returned null");
          }
          else {
            this._enemyTurnInfo = response.Content;

            if (!this._enemyTurnInfo.MatchEndedDateTime) {

              // "you got shot" subscription
              if (!this._youGotShotEvent) {
                this._youGotShotEvent = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.YouGotShot);
                this._socketIOService.on(
                  this._youGotShotEvent,
                  (youGotShotEvent: DTOs.IYouGotShotEventDto) => {
                    for (let change of youGotShotEvent.OwnFieldCellChanges) {
                      //(this._enemyTurnInfo.OwnField as game_client.IOwnBattleFieldCell[][])[change.Coord.X][change.Coord.Y] = change;
                      this._enemyTurnInfo.OwnField[change.Coord.X][change.Coord.Y].Status = change.Status;
                    }
                  });
              }

              // // match ended subscription
              // this._socketIOService.once(
              //   ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchEnded),
              //   (matchEndedEvent: DTOs.IMatchEndedEventDto) => {
              //     this._enemyTurnInfo.MatchEndedDateTime = matchEndedEvent.EndDateTime;
              //     this._winnerId = matchEndedEvent.WinnerId;
              //   });
            }
          }
        },
        (error: ngHttp.HttpErrorResponse) => {
        });
  }

  ngOnDestroy(): void {
    this._socketIOService.removeListener(this._youGotShotEvent);
    this._youGotShotEvent = null;
  }

}