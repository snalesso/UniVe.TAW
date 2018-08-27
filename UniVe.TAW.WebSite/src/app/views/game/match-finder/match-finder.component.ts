import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';
import { DummyGameService } from '../../../services/dummy-game.service';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';
import { Country } from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import { HttpErrorResponse } from '@angular/common/http';

// export type Mutable<T> = {
//   -readonly [P in keyof T]: T[P];
// };

@Component({
  selector: 'app-match-finder',
  templateUrl: './match-finder.component.html',
  styleUrls: ['./match-finder.component.css']
})
export class JoinableMatchesComponent implements OnInit {

  private _playables: DTOs.IPlayablesDto;//= { CanCreateMatch: false, PlayingMatch: null, PendingMatchId: null, JoinableMatches: [] };

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

  constructor(
    private readonly gameService: GameService,
    private readonly router: Router
  ) {
  }

  public createPendingMatch() {

    this._isBusy = true;

    if (this._playables.CanCreateMatch) {
      this.gameService.createPendingMatch().subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
          } else {
            if (response.Content != null && response.Content != undefined) {
              this.updatePlayables();
            }
          }

          this._isBusy = false;
        },
        (error: HttpErrorResponse) => {
          // TODO: handle
          console.log(error);
          this._isBusy = false;
        });
    }
  }

  public closePendingMatch() {

    this._isBusy = true;

    this.gameService.closePendingMatch(this._playables.PendingMatchId).subscribe(
      response => {
        if (response.HasError) {
          console.log(response.ErrorMessage);
        } else {
          if (response.Content) {
            this.updatePlayables();
          }
        }
        this._isBusy = false;
      },
      (error: HttpErrorResponse) => {
        // TODO: handle
        console.log(error);
        this._isBusy = false;
      });
  }

  public joinMatch(joinableMatchId: string) {

    this._isBusy = true;

    this.gameService.joinPendingMatch(joinableMatchId).subscribe(
      response => {
        if (response.HasError) {
          console.log(response.ErrorMessage);
        } else {
          this.router.navigate([ViewsRoutingKeys.Match, joinableMatchId]);
        }
        this._isBusy = false;
      },
      (error: HttpErrorResponse) => {
        // TODO: handle
        console.log(error);
        this._isBusy = false;
      });
  }

  public getCountryName(countryId: identity.Country) {
    return identity.Country[countryId];
  }

  private updatePlayables() {

    this._isBusy = true;

    this.gameService
      .getPlayables()
      .subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
          } else {
            this._playables = response.Content;
            if (this._playables.PlayingMatch) {
              this.router.navigate([ViewsRoutingKeys.Match, this._playables.PlayingMatch.Id]);
            }
          }

          this._isBusy = false;
        },
        (error: HttpErrorResponse) => {
          // TODO: handle
          console.log(error);
          this._isBusy = false;
        });
  }

  ngOnInit() {
    this.updatePlayables();
  }

}