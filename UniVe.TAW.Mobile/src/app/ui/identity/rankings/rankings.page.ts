import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../services/game.service';
import * as game from '../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IdentityService } from '../../../services/identity.service';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.page.html',
  styleUrls: ['./rankings.page.scss']
})
export class RankingsPage implements OnInit {

  private _rankings: DTOs.IUserRanking[];

  constructor(
    private readonly _router: Router,
    private readonly _identityService: IdentityService) { }

  public get UserRankings() { return this._rankings; }

  public goToUserProfile(userId: string) {
    this._router.navigate([ViewsRoutingKeys.Users, userId]);
  }

  ngOnInit() {

    this._identityService.getRankings()
      .subscribe(response => {

        this._rankings = response.Content;
      });

  }

}
