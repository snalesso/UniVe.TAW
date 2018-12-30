import { Component, OnInit, Output, EventEmitter, Input, /*AfterViewInit, AfterContentInit*/ } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

import * as identityDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as utils from '../../../../../assets/unive.taw.webservice/infrastructure/utils';
import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import * as ngHttp from '@angular/common/http';
import * as httpStatusCodes from 'http-status-codes';
import { AuthService } from '../../../../services/auth.service';
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';
import { TouchSequence } from 'selenium-webdriver';
import { BehaviorSubject, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-fleet-configurator',
  templateUrl: './fleet-configurator.component.html',
  styleUrls: ['./fleet-configurator.component.scss']
})
// TODO: rename to match-setup
export class FleetConfiguratorComponent implements OnInit {

  private _shipPlacements: game.ShipPlacement[] = [];

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService) {
  }

  private _matchInfo: gameDTOs.IMatchDto;
  @Input()
  public set MatchInfo(value: gameDTOs.IMatchDto) { this._matchInfo = value; }

  private _cells: game_client.IOwnBattleFieldCell[][];
  public get Cells() { return this._cells; }

  public get BattleFieldWidth(): number { return this._matchInfo.Settings.BattleFieldWidth; }

  private _isRandomizing: boolean = false;
  public get CanRandomize(): boolean { return !this._isRandomizing && !this._isSubmittingConfig; }

  private _isSubmittingConfig: boolean = false;
  public get CanSubmitConfig(): boolean { return !this._isSubmittingConfig && !this._isRandomizing; }

  private rebuildGridCells() {
    if (this._cells == null) {
      this._cells = new Array(this._matchInfo.Settings.BattleFieldWidth);
      for (let x = 0; x < this._matchInfo.Settings.BattleFieldWidth; x++) {
        this._cells[x] = new Array(this._matchInfo.Settings.BattleFieldHeight);
        for (let y = 0; y < this._matchInfo.Settings.BattleFieldHeight; y++) {
          this._cells[x][y] = { Coord: new game.Coord(x, y), ShipType: game.ShipType.NoShip, Status: game_client.OwnBattleFieldCellStatus.Untouched };
        }
      }
    }
    else {
      for (let x = 0; x < this._cells.length; x++) {
        for (let y = 0; y < this._cells[x].length; y++) {
          this._cells[x][y].ShipType = game.ShipType.NoShip;
        }
      }
    }
    this._shipPlacements = [];
  }

  public randomizeFleet() {

    this._isRandomizing = true;

    this.rebuildGridCells();

    let sortedShipsTypesToPlace: game.ShipType[] = [];
    let shipTypeToPlace: game.ShipType;
    let rx: number;
    let ry: number;
    let rOrient: game.Orientation;
    let rPlacement: game.ShipPlacement;

    for (let avShip of this._matchInfo.Settings.ShipTypeAvailabilities) {
      for (let i = 0; i < avShip.Count; i++) {
        sortedShipsTypesToPlace.push(avShip.ShipType);
      }
    }
    sortedShipsTypesToPlace = sortedShipsTypesToPlace.sort(); // sort from smallest to largest, so pop() will extract the largest

    while ((shipTypeToPlace = sortedShipsTypesToPlace.pop()) != null) {

      do {
        rOrient = utils.getRandomBoolean() ? game.Orientation.Vertical : game.Orientation.Horizontal;
        do {
          rx = utils.getRandomInt(0, this._matchInfo.Settings.BattleFieldWidth - (rOrient == game.Orientation.Horizontal ? shipTypeToPlace : 1));
          ry = utils.getRandomInt(0, this._matchInfo.Settings.BattleFieldHeight - (rOrient == game.Orientation.Vertical ? shipTypeToPlace : 1));
        } while (this._cells[rx][ry].ShipType != game.ShipType.NoShip);

        rPlacement = new game.ShipPlacement(shipTypeToPlace, new game.Coord(rx, ry), rOrient);

      } while (!game.FleetValidator.isValidShipPlacement(rPlacement, this._shipPlacements, this._matchInfo.Settings));

      this._shipPlacements.push(rPlacement);
    }

    // generates grid cells from ship placements
    let coords: game.Coord[];
    for (let sp of this._shipPlacements) {
      coords = game.FleetValidator.getShipPlacementCoords(sp);
      for (let coord of coords) {
        this._cells[coord.X][coord.Y].ShipType = sp.Type;
      }
    }

    this._isRandomizing = false;
  }

  public submitConfig(): void {

    this._isSubmittingConfig = true;

    this._gameService
      .configMatch(this._matchInfo.Id, this._shipPlacements)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            console.log(response.ErrorMessage);
          }
          else {
            this._matchInfo.OwnSide.IsConfigured = response.Content;
          }

          this._isSubmittingConfig = false;
        },
        (response: ngHttp.HttpErrorResponse) => {

          switch (response.status) {

            case httpStatusCodes.LOCKED:
              console.log("Match config failed: config is locked");
              this._matchInfo.OwnSide.IsConfigured = true;
              break;

            default:
              const httpMessage = response.error as net.HttpMessage<string>;
              console.log(httpMessage ? httpMessage.ErrorMessage : response.message);

          }

          this._isSubmittingConfig = false;
        });
  }

  ngOnInit(): void {
    this.randomizeFleet();
  }
}