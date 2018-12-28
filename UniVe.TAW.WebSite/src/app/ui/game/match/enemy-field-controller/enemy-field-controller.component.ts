import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

import * as identityDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/chat';

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

  private _firing: boolean = false;
  private _isUpdatingField: boolean = true;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  private _matchSettings: game.IMatchSettings;
  @Input()
  public set MatchSettings(value: game.IMatchSettings) { this._matchSettings = value; }
  public get MatchSettings() { return this._matchSettings; }

  private _enemySide: gameDTOs.IMatchEnemySideDto;
  @Input()
  public set EnemySide(value: gameDTOs.IMatchEnemySideDto) { this._enemySide = value; }
  public get EnemySide() { return this._enemySide; }

  public get Cells() { return this.EnemySide.Cells; }

  @Input()
  @Output()
  public IsMyTurn: boolean;

  public get EnemyId() { return this.EnemySide ? this.EnemySide.Player.Id : undefined; }
  public get EnemyUsername(): string { return this.EnemySide ? this.EnemySide.Player.Username : undefined; }

  public get BattleFieldWidth(): number { return this.MatchSettings ? this.MatchSettings.BattleFieldWidth : 0; }

  public get IsEnabled(): boolean { return this.IsMyTurn && !this._isUpdatingField && !this._firing; }

  public get CanFire(): boolean { return this.IsMyTurn && !this._firing && !this._isUpdatingField; }

  public fire(cell: game_client.IEnemyBattleFieldCell) {

    if (!this.CanFire)
      return;

    this._firing = true;

    if (cell.Status != game_client.EnemyBattleFieldCellStatus.Unknown) {

      this._firing = false;
      return;
    }

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

            this._isUpdatingField = true;

            for (let change of response.Content.EnemyFieldCellChanges) {
              this.Cells[change.Coord.X][change.Coord.Y] = change.Status;
            }

            this._isUpdatingField = false;

            this._ownTurnInfo.OwnsMove = response.Content.DoIOwnMove;
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

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}