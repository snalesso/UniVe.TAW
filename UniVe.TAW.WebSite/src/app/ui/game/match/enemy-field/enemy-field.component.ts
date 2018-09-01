import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as interactjs from 'interactjs';
import * as utils from '../../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import { isNumber } from 'util';

@Component({
  selector: 'app-enemy-field',
  templateUrl: './enemy-field.component.html',
  styleUrls: ['./enemy-field.component.css']
})
export class EnemyFieldComponent implements OnInit {

  // TODO: retrieve
  private readonly _matchId: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService) {
    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);
  }

  private _isEnabled: boolean = false;
  public get IsEnabled(): boolean { return this._isEnabled; }

  private _settings: game.IMatchSettings;
  public get Settings(): game.IMatchSettings { return this._settings; }

  private _gridCells: game_client.IEnemyBattleFieldCell[][];
  public get Cells() { return this._gridCells; }

  private _canFire: boolean = false;
  public get CanFire(): boolean { return this._canFire; }

  private _fireResults: game_client.EnemyBattleFieldCellStatus[] = [
    game_client.EnemyBattleFieldCellStatus.HitShip,
    game_client.EnemyBattleFieldCellStatus.Water,
  ];
  public fire(cell: game_client.IEnemyBattleFieldCell) {

    this._canFire = false;

    if (cell.Status != game_client.EnemyBattleFieldCellStatus.Unknown)
      return;

    const fireResult = this._fireResults[utils.getRandomInt(0, this._fireResults.length - 1)];
    this._gridCells[cell.Coord.X][cell.Coord.Y].Status = fireResult;

    this._canFire = true;
  }

  public getCellStatusUIClass(cell: game_client.IEnemyBattleFieldCell): string {
    return ("bf-grid-cell-" + game_client.EnemyBattleFieldCellStatus[cell.Status]).toLowerCase();
  }

  private cleanFieldGrid() {

    this._canFire = false;

    if (this._gridCells == null) {
      this._gridCells = new Array(this._settings.BattleFieldWidth);
      for (let x = 0; x < this._settings.BattleFieldWidth; x++) {
        this._gridCells[x] = new Array(this._settings.BattleFieldHeight);
        for (let y = 0; y < this._settings.BattleFieldHeight; y++) {
          this._gridCells[x][y] = {
            Coord: new game.Coord(x, y),
            Status: game_client.EnemyBattleFieldCellStatus.Unknown
          };
        }
      }
    }
    else {
      for (let x = 0; x < this._gridCells.length; x++) {
        for (let y = 0; y < this._gridCells[x].length; y++) {
          this._gridCells[x][y].Status = game_client.EnemyBattleFieldCellStatus.Unknown;
        }
      }
    }

    this._canFire = true;
  }

  ngOnInit(): void {
    // console.log("ngOnInit");

    // TODO: handle no resposne
    // this.gameService
    //   .getMatchInfo(localStorage.getItem(ServiceConstants.AccessTokenKey), this._matchId)
    //   .subscribe(response => {
    //     if (response.HasError) {
    //       console.log(response.ErrorMessage);
    //     }
    //     else if (!response.Content) {
    //       console.log("The server returned a null match dto!");
    //     }
    //     else {
    //     }
    //   });

    //this._settings = new game.MatchSettings();
    this.cleanFieldGrid();
  }
}