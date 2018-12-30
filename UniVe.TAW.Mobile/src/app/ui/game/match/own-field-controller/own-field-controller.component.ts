import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

import * as identityDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as utils from '../../../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import Events from '../../../../../assets/unive.taw.webservice/application/Events';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import * as rxjs from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-own-field-controller',
  templateUrl: './own-field-controller.component.html',
  styleUrls: ['./own-field-controller.component.scss']
})
export class OwnFieldControllerComponent implements OnInit, OnDestroy {

  private _youGotShotEventKey: string;

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

  public get Cells() { return this.MatchInfo.OwnSide.Cells; }
  public get BattleFieldWidth(): number { return this.MatchInfo.Settings ? this.MatchInfo.Settings.BattleFieldWidth : 0; }

  public get MyUsername() { return this._authService.IsLogged ? this._authService.LoggedUser.Username : null; }

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

    if (!this.MatchInfo.EndDateTime) {

      this._youGotShotEventKey = Events.matchEventForUser(this._authService.LoggedUser.Id, this.MatchInfo.Id, Events.YouGotShot);
      this._socketIOService.on(
        this._youGotShotEventKey,
        (youGotShotEvent: gameDTOs.IYouGotShotEventDto) => {
          for (let change of youGotShotEvent.OwnFieldCellChanges) {
            this.MatchInfo.OwnSide.Cells[change.Coord.X][change.Coord.Y].Status = change.Status;
          }
          this.MatchInfo.EndDateTime = youGotShotEvent.MatchEndDateTime;
          this.MatchInfo.DidIWin = !!youGotShotEvent.MatchEndDateTime ? !youGotShotEvent.DidILose : undefined;
          this.MatchInfo.CanFire = youGotShotEvent.CanFire;
          if (!this.MatchInfo.CanFire) {
            console.log("emitting");
            this._whenTurnEnded.emit(this.MatchInfo.CanFire);
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this._youGotShotEventKey) {
      this._socketIOService.removeListener(this._youGotShotEventKey);
      this._youGotShotEventKey = null;
    }
  }

}