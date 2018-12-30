import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

import * as identityDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as net from '../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../assets/unive.taw.webservice/infrastructure/game';
import { AuthService } from '../../../services/auth.service';
import * as http from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import Events from '../../../../assets/unive.taw.webservice/application/Events';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {

  private readonly _matchId: string;

  private _matchInfo: gameDTOs.IMatchDto;
  private _matchStartedEventKey: string;
  private _matchCanceledEventKey: string;

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  public get MatchInfo() { return this._matchInfo; }

  public get IsMatchConfigVisible() { return !!this._matchInfo && !this._matchInfo.OwnSide.IsConfigured; }
  public get AreFieldsVisible() { return !!this._matchInfo ? !!this._matchInfo.StartDateTime : false; }
  public get IsWaitingForEnemyToConfig() { return !!this._matchInfo ? !this._matchInfo.StartDateTime && this._matchInfo.OwnSide.IsConfigured : false; }
  public get IsChatVisible() { return !!this._matchInfo; }

  public get EnemyId(): string { return !!this._matchInfo ? this._matchInfo.EnemySide.Player.Id : undefined; }
  public get EnemyUsername(): string { return !!this._matchInfo ? this._matchInfo.EnemySide.Player.Username : undefined; }

  public get IsWinnerBannerVissible(): boolean { return !!this._matchInfo && !!this._matchInfo.EndDateTime; }
  public get DidIWin(): boolean { return (!!this._matchInfo && !!this._matchInfo.EndDateTime) ? this._matchInfo.DidIWin : undefined; }

  ngOnInit() {

    if (!this._matchId) {
      this._router.navigate([ViewsRoutingKeys.Root]);
    }
    else {
      this._gameService.getMatchStatus(this._matchId)
        .subscribe(
          response => {
            if (response.ErrorMessage) {
              console.log(response.ErrorMessage);
            }
            else if (!response.Content) {
              console.log("returned null");
            }
            else {
              this._matchInfo = response.Content;

              if (!this._matchInfo.StartDateTime) {

                this._matchStartedEventKey = Events.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, Events.MatchStarted);
                this._socketIOService.once(
                  this._matchStartedEventKey,
                  (matchStartedEvent: gameDTOs.IMatchStartedEventDto) => {
                    this._matchInfo.StartDateTime = matchStartedEvent.StartDateTime;
                    this._matchInfo.OwnSide.Cells = matchStartedEvent.OwnCells;
                    this._matchInfo.EnemySide.Cells = matchStartedEvent.EnemyCells;
                    this._matchInfo.CanFire = matchStartedEvent.CanFire;
                  });
              }
              if (!this._matchInfo.EndDateTime) {

                this._socketIOService.once(
                  (this._matchCanceledEventKey = Events.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, Events.MatchCanceled)),
                  (event: any) => {
                    alert("This match has been canceled!");
                    this._router.navigate([ViewsRoutingKeys.MatchFinder]);
                  });
              }
            }
          },
          (response: http.HttpErrorResponse) => {
            this._router.navigate([ViewsRoutingKeys.Root]);
          });
    }
  }

  ngOnDestroy(): void {
    if (this._matchStartedEventKey != null) {
      this._socketIOService.removeListener(this._matchStartedEventKey);
      this._matchStartedEventKey = null;
    }
    if (this._matchCanceledEventKey != null) {
      this._socketIOService.removeListener(this._matchCanceledEventKey);
      this._matchCanceledEventKey = null;
    }
  }

}