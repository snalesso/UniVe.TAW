import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
import ServiceEventKeys from '../../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-own-field-controller',
  templateUrl: './own-field-controller.component.html',
  styleUrls: ['./own-field-controller.component.css']
})
export class OwnFieldControllerComponent implements OnInit, OnDestroy {

  private readonly _matchId: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  @Input()
  public MatchSettings: game.IMatchSettings;

  @Input()
  public OwnSideInfo: gameDTOs.IMatchOwnSideDto;

  public get Cells() { return this.OwnSideInfo.Cells; }

  public get BattleFieldWidth(): number { return this.MatchSettings.BattleFieldWidth; }

  public get Username() { return this._authService.IsLogged ? this._authService.LoggedUser.Username : null; }

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
  }

  ngOnDestroy(): void {
  }

}