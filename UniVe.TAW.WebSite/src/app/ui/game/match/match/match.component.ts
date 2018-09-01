import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as net from '../../../../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as http from '@angular/common/http';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);

    if (!this._matchId)
      this._router.navigate([ViewsRoutingKeys.Root]);
  }

  private readonly _matchId: string;
  private _matchSnapshot: DTOs.IMatchSnapshotDto;

  private _isMatchSetupVisible: boolean = false;
  public get IsMatchSetupVisible() { return this._isMatchSetupVisible; }
  // public get IsOwnTurn() { return this._matchSnapshot && this._matchSnapshot.IsOwnTurn; }
  // public get IsEnemyTurn() { return this._matchSnapshot && this._matchSnapshot.IsEnemyTurn; }

  public updateMatchSetupVisibility(isEnabled: boolean) {
    this._isMatchSetupVisible = isEnabled;
    console.log("updateMatchSetupVisibility " + isEnabled);
  }

  // private errorHandler(error: http.HttpErrorResponse) {
  //   // TODO: handle
  //   console.log(error);
  // }

  ngOnInit() {

    // this._gameService.getMatchSnapshot(this._matchId)
    //   .subscribe(
    //     response => {
    //       if (response.HasError) {
    //         console.log(response.ErrorMessage);
    //       }
    //       else if (!response.Content) {
    //         console.log("getMatchSnapshot returned null");
    //       }
    //       else {
    //         this._matchSnapshot = response.Content;
    //       }
    //     },
    //     this.errorHandler);
  }

}
