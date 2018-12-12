import { Component, OnInit, Input, Output, OnDestroy, NgZone } from '@angular/core';
import * as ngHttp from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import { ChatService } from '../../../../services/chat.service';
import { AuthService } from '../../../../services/auth.service';
import { IdentityService } from '../../../../services/identity.service';
import ServiceEventKeys from '../../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as DTOs from '../../../../../assets/unive.taw.webservice/application/DTOs';
import * as ngxSocketIO from 'ngx-socket-io';
import { ElectronService } from '../../../../providers/electron.service';

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.css']
})
export class MatchHistoryComponent implements OnInit {

  private readonly _userId: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    //private readonly _gameService: GameService,
    private readonly _authService: AuthService,
    private readonly _identityService: IdentityService,
    private readonly _zone: NgZone,
    private readonly _electronService: ElectronService
  ) {

    const paramUserId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.userId);
    this._userId = (paramUserId == RoutingParamKeys.self)
      ? this._authService.LoggedUser.Id
      : paramUserId;

    console.log("Current profile: " + this._userId);
  }

  public get UserId() { return this._userId; }

  private _endedMatchSummaries: DTOs.IEndedMatchSummaryDto[];
  public get EndedMatchSummaries() { return this._endedMatchSummaries; }

  public async goToUserProfile(userId: string) {
    //alert(userId);
    console.log(userId);
    await this._zone.run(async () => await this._router.navigate(["users/:" + userId]));
    //location.reload();
  }

  ngOnInit() {

    this._identityService.getMatchHistory(this._userId)
      .subscribe(
        response => {

          this._endedMatchSummaries = response.Content;

        },
        (error: ngHttp.HttpErrorResponse) => { });
  }

}
