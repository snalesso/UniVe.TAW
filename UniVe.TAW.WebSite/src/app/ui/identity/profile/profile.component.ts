import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../services/game.service';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private readonly _userId: string;

  constructor(
    //private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    //private readonly _authService: AuthService
  ) {

    this._userId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.userId);
  }

  ngOnInit() {



  }

}
