import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';
import { SocketIOService } from '../../../services/socket-io.service';
import { Country } from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as http from '@angular/common/http';
import ServiceEventKeys from '../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import * as ngxSocketIO from 'ngx-socket-io';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-match-finder',
  templateUrl: './match-finder.component.html',
  styleUrls: ['./match-finder.component.css']
})
// TODO: update when server emits new pending matches available
export class JoinableMatchesComponent implements OnInit, OnDestroy {

  private _playables: DTOs.IPlayablesDto;
  private _socket = io(ServiceConstants.ServerAddress);

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    //private readonly _socketIOService: SocketIOService
    //private readonly _socketIOService: ngxSocketIO.Socket
  ) {
  }

  private _isBusy: boolean = false;
  public get IsBusy() { return this._isBusy; }

  public get CanCreateMatch() {
    return (this._playables != null ? this._playables.CanCreateMatch : false);
  }

  public get HasPendingMatchOpen() {
    return (this._playables != null ? this._playables.PendingMatchId != null : false);
  }

  public get JoinableMatches() {
    return (this._playables != null ? this._playables.JoinableMatches : null);
  }

  public get AreThereJoinableMatches() {
    return (this._playables != null ? (this._playables.JoinableMatches != null && this._playables.JoinableMatches.length > 0) : false);
  }

  // TODO: ensure that, if browser page is reloaded, a socket.io connection is created to listen for when someone joins the PendingMatch
  public createPendingMatch() {

    this._isBusy = true;

    if (this._playables.CanCreateMatch) {
      this._gameService.createPendingMatch()
        .subscribe(
          response => {
            if (response.HasError) {
              console.log(response.ErrorMessage);
            } else {
              if (response.Content != null && response.Content != undefined) {
                // this._socketIOService.connect().subscribe(message => {
                //   console.log("match-finder received message: " + JSON.stringify(message));
                // });
                this.updatePlayables();
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
          if (response.HasError) {
            console.log(response.ErrorMessage);
          } else {
            if (response.Content) {
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
          if (response.HasError) {
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
          if (response.HasError) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("Server returned null");
          } else {
            this._playables = response.Content;

            if (this._playables.PendingMatchId) {
              this._socket.once(
                ServiceEventKeys.MatchReady,
                (matchReadyEvent: DTOs.IMatchReadyEventDto) => {
                  this._router.navigate([ViewsRoutingKeys.Match, matchReadyEvent.MatchId]);
                });
            }
            else if (this._playables.PlayingMatch) {
              this._router.navigate([ViewsRoutingKeys.Match, this._playables.PlayingMatch.Id]);
            }
          }

          this._isBusy = false;
        }, this.errorHandler);
  }

  private errorHandler(error: http.HttpErrorResponse) {
    // TODO: handle
    console.log(error);
    this._isBusy = false;
  }

  ngOnInit() {
    this._socket.on(ServiceEventKeys.PendingMatchesChanged, (socket) => {
      this.updatePlayables();
    });
    this.updatePlayables();
  }

  ngOnDestroy(): void {
    this._socket.removeListener(ServiceEventKeys.PendingMatchesChanged);
  }

}