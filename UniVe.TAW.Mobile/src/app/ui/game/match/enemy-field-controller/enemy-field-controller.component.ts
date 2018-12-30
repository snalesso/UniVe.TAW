import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
import Events from '../../../../../assets/unive.taw.webservice/application/Events';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-enemy-field-controller',
  templateUrl: './enemy-field-controller.component.html',
  styleUrls: ['./enemy-field-controller.component.scss']
})
export class EnemyFieldControllerComponent implements OnInit, OnDestroy {

  private _firing: boolean = false;
  private _isUpdatingFieldCells: boolean = false;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {
  }

  @Input()
  public MatchInfo: gameDTOs.IMatchDto;

  private readonly _whenTurnEnded = new EventEmitter<boolean>();
  @Output()
  public get WhenTurnEnded() { return this._whenTurnEnded.asObservable(); }

  public get EnemyId() { return this.MatchInfo ? this.MatchInfo.EnemySide.Player.Id : undefined; }
  public get EnemyUsername(): string { return this.MatchInfo ? this.MatchInfo.EnemySide.Player.Username : undefined; }

  public get Cells() { return this.MatchInfo.EnemySide.Cells; }
  public get BattleFieldWidth(): number { return !!this.MatchInfo && !!this.MatchInfo.Settings ? this.MatchInfo.Settings.BattleFieldWidth : 0; }

  public get CanFire(): boolean { return !!this.MatchInfo && this.MatchInfo.CanFire && !this._firing && !this._isUpdatingFieldCells; }

  public fire(cell: game_client.IEnemyBattleFieldCell) {

    if (!this.CanFire)
      return;

    this._firing = true;

    if (cell.Status != game_client.EnemyBattleFieldCellStatus.Unknown) {

      this._firing = false;
      return;
    }

    this._gameService.singleShot(this.MatchInfo.Id, { Coord: cell.Coord } as game.ISingleShotMatchAction)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("The server returned null");
          }
          else {

            this._isUpdatingFieldCells = true;

            for (let change of response.Content.EnemyFieldCellChanges) {
              this.MatchInfo.EnemySide.Cells[change.Coord.X][change.Coord.Y].Status = change.Status;
            }

            this.MatchInfo.EndDateTime = response.Content.MatchEndDateTime;
            this.MatchInfo.DidIWin = !!response.Content.MatchEndDateTime ? response.Content.DidWin : undefined;
            this.MatchInfo.CanFire = response.Content.CanFireAgain;

            this._isUpdatingFieldCells = false;
          }

          this._firing = false;

          if (!this.MatchInfo.CanFire) {
            console.log("emitting");
            this._whenTurnEnded.emit();
          }
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