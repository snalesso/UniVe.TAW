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
import ServiceEventKeys from '../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {

  private readonly _matchId: string;

  private _matchStatus: gameDTOs.IMatchDto;
  private _matchStartedEventKey: string;
  private _matchEndedEventKey: string;
  private _matchCanceledEventKey: string;

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  public get MatchId() { return this._matchId; }

  public get MatchSettings() { return this._matchStatus ? this._matchStatus.Settings : undefined; }

  public get OwnFieldCells() { return this._matchStatus ? this._matchStatus.OwnSide.Cells : undefined; }

  public get EnemyFieldCells() { return this._matchStatus ? this._matchStatus.EnemySide.Cells : undefined; }

  public get IsMatchStarted() { return this._matchStatus ? !!this._matchStatus.StartDateTime : undefined; }

  public get IsMatchEnded(): boolean { return this._matchStatus ? !!this._matchStatus.EndDateTime : undefined; }

  public get IsWaitingForEnemyToConfig() { return !this.IsMatchStarted && this._matchStatus.OwnSide.IsConfigured == true; }

  public get EnemyId(): string { return this._matchStatus ? this._matchStatus.EnemySide.Player.Id : undefined; }

  public get EnemyUsername(): string { return this._matchStatus ? this._matchStatus.EnemySide.Player.Username : undefined; }

  public get DidIWin(): boolean { return this.IsMatchEnded ? this._matchStatus.DidIWin : undefined; }

  public handleWhenIsConfiguredChanged(value: boolean) {
    this._matchStatus.OwnSide.IsConfigured = value;
  }

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
              this._matchStatus = response.Content;

              if (!this._matchStatus.StartDateTime) {

                this._matchStartedEventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchStarted);
                this._socketIOService.once(
                  this._matchStartedEventKey,
                  (matchStartedEvent: gameDTOs.IMatchStartedEventDto) => {
                    this._matchStatus.StartDateTime = matchStartedEvent.StartDateTime;
                  });
              }
              if (!this._matchStatus.EndDateTime) {

                this._matchEndedEventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchEnded);
                this._socketIOService.once(
                  this._matchEndedEventKey,
                  (matchEndedEvent: gameDTOs.IMatchEndedEventDto) => {
                    if (this._matchStatus) {
                      this._matchStatus.EndDateTime = matchEndedEvent.EndDateTime;
                      this._matchStatus.DidIWin = (matchEndedEvent.WinnerId && matchEndedEvent.WinnerId == this._authService.LoggedUser.Id);
                    }
                  });
              }

              this._socketIOService.once(
                (this._matchCanceledEventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchCanceled)),
                (event: any) => {
                  alert("This match has been canceled!");
                  this._router.navigate([ViewsRoutingKeys.MatchFinder]);
                }
              );
            }
          },
          (response: http.HttpErrorResponse) => {
            this._router.navigate([ViewsRoutingKeys.MatchFinder]);
          });
    }
  }

  ngOnDestroy(): void {
    if (this._matchStartedEventKey != null) {
      this._socketIOService.removeListener(this._matchStartedEventKey);
      this._matchStartedEventKey = null;
    }
    if (this._matchEndedEventKey != null) {
      this._socketIOService.removeListener(this._matchEndedEventKey);
      this._matchEndedEventKey = null;
    }
    if (this._matchCanceledEventKey != null) {
      this._socketIOService.removeListener(this._matchCanceledEventKey);
      this._matchCanceledEventKey = null;
    }
  }

}