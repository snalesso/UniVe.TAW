import { Component, OnInit, /*AfterViewInit, AfterContentInit*/ } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
//import * as interactjs from 'interactjs';
import * as utils from '../../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import * as $ from 'jquery';
import { HttpErrorResponse } from '@angular/common/http';
import * as httpStatusCodes from 'http-status-codes';
import { AuthService } from '../../../../services/auth.service';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-fleet-configurator',
  templateUrl: './fleet-configurator.component.html',
  styleUrls: ['./fleet-configurator.component.css']
})
export class FleetConfiguratorComponent implements OnInit/*, AfterViewInit, AfterContentInit*/ {

  private readonly _matchId: string;
  private _shipPlacements: game.ShipPlacement[] = [];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService,
    private readonly authService: AuthService) {
  }

  private _settings: game.MatchSettings;
  public get Settings(): game.MatchSettings { return this._settings; }

  private _gridCells: { Coord: game.Coord, ShipType: game.ShipType }[][]; // TODO: create ad-hoc type
  public get Cells() { return this._gridCells; }

  private _canRandomize: boolean = true;
  public get CanRandomize(): boolean { return this._canRandomize; }

  private _canSubmitConfig: boolean = true;
  public get CanSubmitConfig(): boolean { return this._canSubmitConfig; }

  private cleanFieldGrid() {
    if (this._gridCells == null) {
      this._gridCells = new Array(this._settings.BattleFieldSettings.BattleFieldWidth);
      for (let x = 0; x < this._settings.BattleFieldSettings.BattleFieldWidth; x++) {
        this._gridCells[x] = new Array(this._settings.BattleFieldSettings.BattleFieldHeight);
        for (let y = 0; y < this._settings.BattleFieldSettings.BattleFieldHeight; y++) {
          this._gridCells[x][y] = { Coord: new game.Coord(x, y), ShipType: game.ShipType.NoShip };
        }
      }
    }
    else {
      for (let x = 0; x < this._gridCells.length; x++) {
        for (let y = 0; y < this._gridCells[x].length; y++) {
          this._gridCells[x][y].ShipType = game.ShipType.NoShip;
        }
      }
    }
    this._shipPlacements = [];
  }

  public randomizeFleet() {

    this._canRandomize = this._canSubmitConfig = false;

    this.cleanFieldGrid();

    let sortedShipsTypesToPlace: game.ShipType[] = [];
    let shipTypeToPlace: game.ShipType;
    let rx: number;
    let ry: number;
    let rOrient: game.ShipOrientation;
    let rPlacement: game.ShipPlacement;

    for (let avShip of this._settings.AvailableShips) {
      for (let i = 0; i < avShip.Count; i++) {
        sortedShipsTypesToPlace.push(avShip.ShipType);
      }
    }
    sortedShipsTypesToPlace = sortedShipsTypesToPlace.sort(); // sort from smallest to largest, so pop() will extract the largest

    while ((shipTypeToPlace = sortedShipsTypesToPlace.pop()) != null) {

      do {
        rOrient = utils.getRandomBoolean() ? game.ShipOrientation.Vertical : game.ShipOrientation.Horizontal;
        do {
          rx = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldWidth - (rOrient == game.ShipOrientation.Horizontal ? shipTypeToPlace : 1));
          ry = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldHeight - (rOrient == game.ShipOrientation.Vertical ? shipTypeToPlace : 1));
        } while (this._gridCells[rx][ry].ShipType != game.ShipType.NoShip);

        rPlacement = new game.ShipPlacement(shipTypeToPlace, new game.Coord(rx, ry), rOrient);

      } while (!game.FleetValidator.isValidShipPlacement(rPlacement, this._shipPlacements, this._settings));

      this._shipPlacements.push(rPlacement);
      //this._gridCells[rPlacement.Coord.X][rPlacement.Coord.Y] = rPlacement;
    }

    // generates grid cells from ship placements
    let coords: game.Coord[];
    for (let sp of this._shipPlacements) {
      coords = game.FleetValidator.getShipPlacementCoords(sp);
      for (let coord of coords) {
        this._gridCells[coord.X][coord.Y].ShipType = sp.Type;
      }
    }

    this._canRandomize = this._canSubmitConfig = true;
  }

  public submitConfig(): void {

    this._canSubmitConfig = this._canRandomize = false;

    // TODO: handle no resposne
    this.gameService.createMatch(localStorage.getItem(ServiceConstants.AccessTokenKey), this._shipPlacements)
      .subscribe(response => {
        if (response.HasError) {
          console.log(response.ErrorMessage);
          this._canSubmitConfig = this._canRandomize = true;
        }
        else if (!response.Content) {
          console.log("The server returned a null matchId");
          this._canSubmitConfig = this._canRandomize = true;
        }
        else {
          throw new Error("Match creation/joining not implemented!");
        }
      });
  }

  ngOnInit(): void {
    // console.log("ngOnInit");
    this.getSettings();
  }

  private getSettings(maxRetries: number = 1) {

    // TODO: handle no resposne
    this.gameService
      .getNewMatchSettings(localStorage.getItem(ServiceConstants.AccessTokenKey))
      .subscribe(
        response => {
          if (response.HasError) {
            // TODO: handle
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            // TODO: handle
            console.log("The server returned a null match dto!");
          }
          else {
            const bfs = new game.BattleFieldSettings(response.Content.BattleFieldSettings.BattleFieldWidth, response.Content.BattleFieldSettings.BattleFieldHeight);
            const stas = response.Content.ShipTypeAvailability.map(staDto => new game.ShipTypeAvailability(staDto.ShipType, staDto.Count));
            const sett = new game.MatchSettings(bfs, stas, response.Content.MinShipDistance);
            this._settings = sett;

            this.randomizeFleet();
          }
        },
        (error: HttpErrorResponse) => {
          if (error.status == httpStatusCodes.UNAUTHORIZED) {
            const credentials: DTOs.ILoginCredentials = {
              Username: localStorage.getItem(ServiceConstants.AccessCredentials_Username),
              Password: localStorage.getItem(ServiceConstants.AccessCredentials_Password)
            };
            this.authService.login(credentials).subscribe(
              response => {
                if (response.HasError) {
                  // TODO: handle
                }
                else if (!response.Content) {
                  // TODO: handle
                  console.log("The server returned a null match dto!");
                }
                else {
                  localStorage.setItem(ServiceConstants.AccessTokenKey, response.Content);
                }

                if (maxRetries > 0) {
                  this.getSettings(--maxRetries);
                }
              },
              (error: HttpErrorResponse) => {
                this.router.navigate([ViewsRoutingKeys.Login])
              });
          }
        });
  }

  ngAfterViewInit(): void {
    //console.log("ngAfterViewInit");
  }

  ngAfterContentInit(): void {
    //console.log("ngAfterContentInit");
  }
}