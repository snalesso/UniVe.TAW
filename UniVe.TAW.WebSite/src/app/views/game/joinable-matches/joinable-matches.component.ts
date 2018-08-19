import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';
import { DummyGameService } from '../../../services/dummy-game.service';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import Constants from '../../../services/constants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';
import { Country } from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';

// export type Mutable<T> = {
//   -readonly [P in keyof T]: T[P];
// };

@Component({
  selector: 'app-joinable-matches',
  templateUrl: './joinable-matches.component.html',
  styleUrls: ['./joinable-matches.component.css']
})
export class JoinableMatchesComponent implements OnInit {

  public JoinableMatches: DTOs.IJoinableMatchDto[];
  //public Xfew: Mutable<DTOs.IUserDto>;

  private sta: game.ShipTypeAvailability;

  constructor(
    private readonly gameService: GameService,
    //private readonly gameService: DummyGameService
    private readonly router: Router
  ) {
  }

  public joinMatch(matchId: string) {
    console.log("Clicked match with id " + matchId);
  }

  public createNewMatch() {
    this.router.navigate([ViewsRoutingKeys.FleetConfigurator]);
  }

  ngOnInit() {
    this.gameService
      .getJoinableMatches(localStorage.getItem(Constants.AccessTokenKey))
      .subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
          } else {
            this.JoinableMatches = response.Content;
          }
        },
        error => console.log(error));
  }

}
