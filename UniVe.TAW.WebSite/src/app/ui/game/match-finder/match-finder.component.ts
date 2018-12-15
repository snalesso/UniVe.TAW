import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';

import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/unive.taw.webservice/infrastructure/utils';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import { Country } from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as net from '../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../assets/unive.taw.webservice/infrastructure/game';
import * as http from '@angular/common/http';
import ServiceEventKeys from '../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import * as ngxSocketIO from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import * as httpStatusCodes from 'http-status-codes';

@Component({
  selector: 'app-match-finder',
  templateUrl: './match-finder.component.html',
  styleUrls: ['./match-finder.component.css']
})
export class MatchFinderComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription[] = [];

  private _playables: DTOs.IPlayablesDto;

  private _pendingMatchesChangedEventKey: string;
  private _pendingMatchJoinedEventKey: string;

  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _gameService: GameService,
    private readonly _socketIOService: ngxSocketIO.Socket
  ) {
  }

  private _isBusy: boolean = false;
  public get IsBusy() { return this._isBusy; }

  public get CanCreateMatch() { return (this._playables != null ? this._playables.CanCreateMatch : false); }

  public get HasPendingMatchOpen() { return (this._playables != null ? this._playables.PendingMatchId != null : false); }

  public get JoinableMatches() { return (this._playables != null ? this._playables.JoinableMatches : null); }

  public get AreThereJoinableMatches() { return (this._playables != null ? (this._playables.JoinableMatches != null && this._playables.JoinableMatches.length > 0) : false); }

  public createPendingMatch() {

    this._isBusy = true;

    if (this._playables.CanCreateMatch) {
      this._gameService.createPendingMatch()
        .subscribe(
          response => {
            if (response.ErrorMessage) {
              console.log(response.ErrorMessage);
            } else if (response.Content) {
              this.updatePlayables();
            }

            this._isBusy = false;
          }, this.errorHandler);
    }
  }

  public closePendingMatch() {

    this._isBusy = true;

    this._gameService.closePendingMatch(this._playables.PendingMatchId)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          } else {
            if (response.Content) {
              if (this._pendingMatchJoinedEventKey) {
                this._socketIOService.removeListener(this._pendingMatchJoinedEventKey);
                this._pendingMatchJoinedEventKey = null;
              }
              this.updatePlayables();
            }
          }
          this._isBusy = false;
        }, this.errorHandler);
  }

  public joinMatch(joinableMatchId: string) {

    this._isBusy = true;

    this._gameService.joinPendingMatch(joinableMatchId)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          } else if (response.Content == null) {
            console.log("Server returned null :O");
          }
          else {
            this._router.navigate([ViewsRoutingKeys.Match, response.Content]);
          }
          this._isBusy = false;
        }, this.errorHandler);
  }

  public getCountryName(countryId: identity.Country) {
    return identity.Country[countryId];
  }

  private updatePlayables() {

    this._isBusy = true;

    this._gameService.getPlayables()
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("Server returned null");
          } else {
            this._playables = response.Content;

            if (this._playables.PendingMatchId) {

              this._socketIOService.once(
                (this._pendingMatchJoinedEventKey = ServiceEventKeys.pendingMatchJoined(this._authService.LoggedUser.Id, this._playables.PendingMatchId)),
                (pendingMatchJoinedEvent: DTOs.IPendingMatchJoinedEventDto) => {
                  this._router.navigate([ViewsRoutingKeys.Match, pendingMatchJoinedEvent.MatchId]);
                });
            }
            else if (this._playables.PlayingMatchId) {
              this._router.navigate([ViewsRoutingKeys.Match, this._playables.PlayingMatchId]);
            }
          }

          this._isBusy = false;
        }, (response: http.HttpErrorResponse) => {
          this._isBusy = false;
          const httpMessage = response.error as net.HttpMessage<string>;

          switch (response.status) {
            case httpStatusCodes.UNAUTHORIZED: {
              console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
              this._authService.logout();
              break;
            }
          }
        });
  }

  private errorHandler(response: http.HttpErrorResponse) {
    const httpMessage = response.error as net.HttpMessage<string>;
    console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
    this._isBusy = false;
  }

  ngOnInit() {

    this._pendingMatchesChangedEventKey = ServiceEventKeys.PendingMatchesChanged;
    this._socketIOService.on(this._pendingMatchesChangedEventKey, () => this.updatePlayables());

    this.updatePlayables();
  }

  ngOnDestroy(): void {

    if (this._pendingMatchJoinedEventKey) {
      this._socketIOService.removeListener(this._pendingMatchJoinedEventKey);
      this._pendingMatchJoinedEventKey = null;
    }
    if (this._pendingMatchesChangedEventKey) {
      this._socketIOService.removeListener(this._pendingMatchesChangedEventKey);
      this._pendingMatchesChangedEventKey = null;
    }
  }

}