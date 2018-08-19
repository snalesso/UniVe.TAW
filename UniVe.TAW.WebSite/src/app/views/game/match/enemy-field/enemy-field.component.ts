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
  selector: 'app-enemy-field',
  templateUrl: './enemy-field.component.html',
  styleUrls: ['./enemy-field.component.css']
})
export class EnemyFieldComponent implements OnInit {

  // TODO: retrieve
  private readonly _matchId: string;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService) {
    //this._matchId = this.route.para
  }

  private _settings: game.MatchSettings;
  public get Settings(): game.MatchSettings { return this._settings; }

  public get ClientSideBattleFieldCell_Enemy() { return game_client.ClientSideBattleFieldCell_Enemy; }

  private _gridCells: { Coord: game.Coord, Status: game_client.ClientSideBattleFieldCellStatus_Enemy }[][];
  public get GridCells() { return this._gridCells; }

  private _canFire: boolean = true;
  public get CanFire(): boolean { return this._canFire; }

  public fire(coord: game.Coord) {
  }

  ngOnInit(): void {
    // console.log("ngOnInit");

    // TODO: handle no resposne
    this.gameService
      .getMatchInfo(localStorage.getItem(Constants.AccessTokenKey), this._matchId)
      .subscribe(response => {
        if (response.HasError) {
          console.log(response.ErrorMessage);
        }
        else if (!response.Content) {
          console.log("The server returned a null match dto!");
        }
        else {
        }
      });
  }

}
