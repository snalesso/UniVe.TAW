import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import Constants from '../../../../services/constants';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as interactjs from 'interactjs';
import * as utils from '../../../../../assets/imported/unive.taw.webservice/infrastructure/utils';

@Component({
  selector: 'app-own-field',
  templateUrl: './own-field.component.html',
  styleUrls: ['./own-field.component.css']
})
export class OwnFieldComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService) { }

  ngOnInit() {
  }

}
