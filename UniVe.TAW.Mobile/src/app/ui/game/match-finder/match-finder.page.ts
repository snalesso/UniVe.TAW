import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';

import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/unive.taw.webservice/infrastructure/utils';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import { Country } from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as game from '../../../../assets/unive.taw.webservice/infrastructure/game';
import * as http from '@angular/common/http';
import ServiceEventKeys from '../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import * as ngxSocketIO from 'ngx-socket-io';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-match-finder',
  templateUrl: './match-finder.page.html',
  styleUrls: ['./match-finder.page.scss'],
})
export class MatchFinderPage implements OnInit, OnDestroy {

  private _playables: DTOs.IPlayablesDto;
  private _socket = io(ServiceConstants.ServerAddress);

  private _pendingMatchesChangedEventKey: string;
  private _pendingMatchJoinedEventKey: string;

  constructor(
    private readonly _zone: NgZone,
    private readonly _router: Router,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService,
  ) {
  }

  private _isBusy: boolean = false;
  public get IsBusy() { return this._isBusy; }

  public get CanCreateMatch() { return (this._playables != null ? this._playables.CanCreateMatch : false); }

  public get HasPendingMatchOpen() { return (this._playables != null ? this._playables.PendingMatchId != null : false); }

  public get JoinableMatches() { return (this._playables != null ? this._playables.JoinableMatches : null); }

  public get AreThereJoinableMatches() { return (this._playables != null ? (this._playables.JoinableMatches != null && this._playables.JoinableMatches.length > 0) : false); }

  // TODO: ensure that, if browser page is reloaded, a socket.io connection is created to listen for when someone joins the PendingMatch
  public createPendingMatch() {

    this._isBusy = true;

    if (this._playables.CanCreateMatch) {
      this._gameService.createPendingMatch()
        .subscribe(
          response => {
            if (response.ErrorMessage) {
              console.log(response.ErrorMessage);
            } else {
              if (response.Content != null && response.Content != undefined) {
                // this._socketIOService.connect().subscribe(message => {
                //   console.log("match-finder received message: " + JSON.stringify(message));
                // });
                //this.updatePlayables();
              }
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
                this._socket.removeListener(this._pendingMatchJoinedEventKey);
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
            console.log("WTF?? Server returned null Match.Id without providing a reason! :O");
            alert("WTF?? Server returned null Match.Id without providing a reason! :O");
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
            this._isBusy = false;

          }
          else if (!response.Content) {

            console.log("Server returned null");
            this._isBusy = false;

          } else {
            // dfaewf

            this._playables = response.Content;
            this._isBusy = false;

            if (this._playables.PendingMatchId) {

              this._pendingMatchJoinedEventKey = ServiceEventKeys.pendingMatchJoined(this._authService.LoggedUser.Id, this._playables.PendingMatchId);
              this._socket.once(this._pendingMatchJoinedEventKey,
                (pendingMatchJoinedEvent: DTOs.IPendingMatchJoinedEventDto) => {
                  setTimeout(() => {
                    this._router.navigate([ViewsRoutingKeys.Match, pendingMatchJoinedEvent.MatchId]);
                  }, 100);
                });

            }
            else if (this._playables.PlayingMatch) {

              setTimeout(() => {
                this._router.navigate([ViewsRoutingKeys.Match, this._playables.PlayingMatch.Id]);
              }, 100);
            }

          }
        }, this.errorHandler);
  }

  private errorHandler(error: http.HttpErrorResponse) {
    // TODO: handle
    console.log(error);
    this._isBusy = false;
  }

  ngOnInit() {

    this._pendingMatchesChangedEventKey = ServiceEventKeys.PendingMatchesChanged;
    this._socket.on(this._pendingMatchesChangedEventKey, () => this.updatePlayables());

    this.updatePlayables();
  }

  ngOnDestroy(): void {
    // for (let sub of this._subscriptions) {
    //   sub.unsubscribe();
    // }
    if (this._pendingMatchJoinedEventKey) {
      this._socket.removeListener(this._pendingMatchJoinedEventKey);
      this._pendingMatchJoinedEventKey = null;
    }
    if (this._pendingMatchesChangedEventKey) {
      this._socket.removeListener(this._pendingMatchesChangedEventKey);
      this._pendingMatchesChangedEventKey = null;
    }
  }

}