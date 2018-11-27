import { Component, OnInit, Output, EventEmitter, /*AfterViewInit, AfterContentInit*/ } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../services/game.service';
import { IdentityService } from '../../../services/identity.service';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import { HttpErrorResponse } from '@angular/common/http';
import * as httpStatusCodes from 'http-status-codes';
import { AuthService } from '../../../services/auth.service';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';

@Component({
  selector: 'app-mod-panel',
  templateUrl: './mod-panel.component.html',
  styleUrls: ['./mod-panel.component.css']
})
export class ModPanelComponent implements OnInit {

  constructor(
    //private readonly _router: Router,
    //private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    //private readonly _gameService: GameService,
    private readonly _identityService: IdentityService
  ) { }

  ngOnInit() {


  }

}
