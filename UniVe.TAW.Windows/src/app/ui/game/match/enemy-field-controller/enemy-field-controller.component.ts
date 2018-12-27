import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../../assets/unive.taw.webservice/infrastructure/utils';
import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-enemy-field-controller',
  templateUrl: './enemy-field-controller.component.html',
  styleUrls: ['./enemy-field-controller.component.css']
})
export class EnemyFieldControllerComponent implements OnInit, OnDestroy {

  private readonly _matchId: string;

  private _ownTurnInfo: DTOs.IOwnTurnInfoDto;
  private _firing: boolean = false;
  private _isRebuildingCells: boolean = true;

  private _matchUpdatedeventKey: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  public get EnemyId() { return (this._ownTurnInfo != null && this._ownTurnInfo.Enemy != null) ? this._ownTurnInfo.Enemy.Id : null; }

  public get EnemyUsername(): string { return (this._ownTurnInfo != null && this._ownTurnInfo.Enemy != null) ? this._ownTurnInfo.Enemy.Username : null; }

  public get BattleFieldWidth(): number { return (this._ownTurnInfo && this._ownTurnInfo.MatchSettings) ? this._ownTurnInfo.MatchSettings.BattleFieldWidth : 0; }

  private _gridCells: game_client.IEnemyBattleFieldCell[][];
  public get Cells() { return this._gridCells; }

  private get IsMyTurn(): boolean { return this._ownTurnInfo != null ? this._ownTurnInfo.OwnsMove : false; }

  public get IsEnabled(): boolean { return this.IsMyTurn && !this._isRebuildingCells && !this._firing; }

  public get CanFire(): boolean { return this.IsMyTurn && !this._firing && !this._isRebuildingCells; }

  public fire(cell: game_client.IEnemyBattleFieldCell) {

    if (!this.CanFire)
      return;

    this._firing = true;

    if (cell.Status != game_client.EnemyBattleFieldCellStatus.Unknown) {

      this._firing = false;
      return;
    }

    // const fireResult = this._fireResults[utils.getRandomInt(0, this._fireResults.length - 1)];
    // this._gridCells[cell.Coord.X][cell.Coord.Y].Status = fireResult;

    this._gameService.singleShot(this._matchId, { Coord: cell.Coord } as game.ISingleShotMatchAction)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("The server returned null");
          }
          else {
            //this._ownTurnInfo.EnemyField = response.Content.NewEnemyField;
            this._isRebuildingCells = true;
            for (let change of response.Content.EnemyFieldCellChanges) {
              this._gridCells[change.Coord.X][change.Coord.Y].Status = change.Status;
            }
            this._isRebuildingCells = false;

            this._ownTurnInfo.OwnsMove = response.Content.DoIOwnMove;
            //this.rebuildGridCells();
          }

          this._firing = false;
        },
        (response: ngHttp.HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);

          this._firing = false;
        });
  }

  public getCellStatusUIClass(cell: game_client.IEnemyBattleFieldCell): string {
    return ("bf-grid-cell-" + game_client.EnemyBattleFieldCellStatus[cell.Status]).toLowerCase();
  }

  private rebuildGridCells() {

    this._isRebuildingCells = true;

    if (!this._ownTurnInfo || !this._ownTurnInfo.MatchSettings)
      return;

    if (this._gridCells == null) {
      this._gridCells = new Array(this._ownTurnInfo.MatchSettings.BattleFieldWidth);
      for (let x = 0; x < this._ownTurnInfo.MatchSettings.BattleFieldWidth; x++) {
        this._gridCells[x] = new Array(this._ownTurnInfo.MatchSettings.BattleFieldHeight);
        for (let y = 0; y < this._ownTurnInfo.MatchSettings.BattleFieldHeight; y++) {
          this._gridCells[x][y] = {
            Coord: new game.Coord(x, y),
            Status: this._ownTurnInfo.EnemyField[x][y]
          };
        }
      }
    }
    else {
      for (let x = 0; x < this._gridCells.length; x++) {
        for (let y = 0; y < this._gridCells[x].length; y++) {
          this._gridCells[x][y].Status = this._ownTurnInfo.EnemyField[x][y];
        }
      }
    }

    this._isRebuildingCells = false;
  }

  private updateInfo() {

    this._gameService
      .getOwnTurnInfo(this._matchId)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("The server returned null");
          }
          else {
            this._ownTurnInfo = response.Content;

            if (!this._matchUpdatedeventKey) {
              this._matchUpdatedeventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchUpdated);
              this._socketIOService.on(this._matchUpdatedeventKey, () => {
                this.updateInfo();
              });
            }

            this.rebuildGridCells();
          }
        },
        (response: ngHttp.HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
        });
  }

  ngOnInit(): void {
    this.updateInfo();
  }

  ngOnDestroy(): void {
    if (this._matchUpdatedeventKey) {
      this._socketIOService.removeListener(this._matchUpdatedeventKey);
      this._matchUpdatedeventKey = null;
    }
  }
}