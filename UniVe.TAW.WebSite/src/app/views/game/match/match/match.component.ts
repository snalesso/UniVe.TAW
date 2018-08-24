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
    private readonly gameService: GameService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {
    // console.log("match component ctor");
    this._matchId = this.activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);
  }

  private _matchId: string;
  public get MatchId() { return this._matchId; }

  ngOnInit() {
  }

}
