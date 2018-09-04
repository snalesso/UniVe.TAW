import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as net from '../../../../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as http from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  private readonly _matchId: string;

  private _matchStatus: DTOs.IOwnSideMatchStatus;

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _socketIOService: ngxSocketIO.Socket) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);

    if (!this._matchId)
      this._router.navigate([ViewsRoutingKeys.Root]);
  }

  public Toggle: boolean = true;

  public get IsMatchSetupVisible() { return this._matchStatus != null && this._matchStatus.IsConfigNeeded; }

  public get AreTurnControllersVisible() { return this._matchStatus != null && this._matchStatus.IsMatchStarted; }

  private errorHandler(error: http.HttpErrorResponse) {
    // TODO: handle
    console.log(error);
  }

  public handleWhenIsConfigNeededChanged(value: boolean) {
    this._matchStatus.IsConfigNeeded = value;
  }

  public aaa($event) {
    console.log("event");
  }

  private updateMatchStatus() {

    this._gameService.getOwnSideMatchStatus(this._matchId)
      .subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            console.log("getOwnSideMatchStatus returned null");
          }
          else {
            this._matchStatus = response.Content;
            if (!this._matchStatus.IsMatchStarted) {
              this._socketIOService.once(ServiceEventKeys.MatchStarted, (matchStartedEvent: DTOs.IMatchStartedEventDto) => this.updateMatchStatus());
            }
          }
        },
        this.errorHandler);
  }

  ngOnInit() {

    this.updateMatchStatus();
  }

}