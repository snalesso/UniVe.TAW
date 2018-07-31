import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import Constants from '../../../services/constants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';
import { Country } from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';

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

  constructor() {
    this.JoinableMatches = this.getFakeJoinableMatches(10);
  }

  public joinMatch(matchId: string) {
    console.log("Clicked match with id " + matchId);
  }

  private getFakeJoinableMatches(count: number): DTOs.IJoinableMatchDto[] {
    let fakeMatches: DTOs.IJoinableMatchDto[] = [];
    const countriesCount = Object.keys(identity.Country).filter(countryName => !isNaN(identity.Country[countryName])).length;

    for (let i = 1; i <= count; i++) {
      let rci =
        fakeMatches.push({
          Id: "MatchId #" + i,
          Creator: {
            Id: "Match creator id #" + i,
            Username: "Creator of match #" + i,
            CountryId: utils.getRandomInt(0, countriesCount),
            Age: utils.getRandomInt(3, 100)
          }
        });
    }

    return fakeMatches;
  }

  ngOnInit() {
  }

}
