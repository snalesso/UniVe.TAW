import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';

@Component({
  selector: 'app-own-turn-controller',
  templateUrl: './own-turn-controller.component.html',
  styleUrls: ['./own-turn-controller.component.css']
})
export class OwnTurnControllerComponent implements OnInit {

  private readonly _matchId: string;
  private _ownTurnInfo: DTOs.IOwnTurnInfoDto;

  private _firing: boolean = false;
  private _isRebuildingCells: boolean = true;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);
  }

  public get BattleFieldWidth(): number { return (this._ownTurnInfo && this._ownTurnInfo.MatchSettings) ? this._ownTurnInfo.MatchSettings.BattleFieldWidth : 0; }

  private _gridCells: game_client.IEnemyBattleFieldCell[][];
  public get Cells() { return this._gridCells; }

  private get IsMyTurn() { return this._ownTurnInfo ? this._ownTurnInfo.IsOwnTurn : false; }

  public get IsEnabled(): boolean { return this.IsMyTurn && !this._isRebuildingCells && !this._firing; }

  public get CanFire(): boolean { return this.IsMyTurn && !this._firing; }

  public fire(cell: game_client.IEnemyBattleFieldCell) {

    this._firing = true;

    if (cell.Status != game_client.EnemyBattleFieldCellStatus.Unknown)
      return;

    // const fireResult = this._fireResults[utils.getRandomInt(0, this._fireResults.length - 1)];
    // this._gridCells[cell.Coord.X][cell.Coord.Y].Status = fireResult;

    this._firing = false;
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
            Status: game_client.EnemyBattleFieldCellStatus.Unknown
          };
        }
      }
    }
    else {
      for (let x = 0; x < this._gridCells.length; x++) {
        for (let y = 0; y < this._gridCells[x].length; y++) {
          this._gridCells[x][y].Status = game_client.EnemyBattleFieldCellStatus.Unknown;
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
          if (response.HasError) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("The server returned null");
          }
          else {
            this._ownTurnInfo = response.Content;
            this.rebuildGridCells();
          }
        },
        (error: ngHttp.HttpErrorResponse) => {
        });
  }

  ngOnInit(): void {

    this._socketIOService.once(
      ServiceEventKeys.MatchStarted,
      (matchStarted: DTOs.IMatchStartedEventDto) => {
        this.updateInfo();
      });

    this.updateInfo();
    // console.log("ngOnInit");

    // TODO: handle no resposne

  }
}