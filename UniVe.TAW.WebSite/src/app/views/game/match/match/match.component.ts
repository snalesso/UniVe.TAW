import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute
  ) {
    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);
  }

  private _matchId: string;
  public get MatchId() { return this._matchId; }

  ngOnInit() {
  }

}
