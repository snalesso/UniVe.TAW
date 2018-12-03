import { Component, OnInit, Output, EventEmitter, /*AfterViewInit, AfterContentInit*/ } from '@angular/core';
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
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';
import { TouchSequence } from 'selenium-webdriver';
import { BehaviorSubject, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-fleet-configurator',
  templateUrl: './fleet-configurator.component.html',
  styleUrls: ['./fleet-configurator.component.css']
})
// TODO: rename to match-setup
export class FleetConfiguratorComponent implements OnInit {

  private readonly _matchId: string;

  private _shipPlacements: game.ShipPlacement[] = [];

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
    //this.WhenToggleChanged.subscribe(v => console.log("fc - toggle - " + v));
  }

  private _whenIsConfigNeededChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @Output()
  public get WhenIsConfigNeededChanged(): Observable<boolean> { return this._whenIsConfigNeededChanged; }

  private _ownMatchSideConfigStatus: DTOs.IOwnSideMatchConfigStatus;

  public get BattleFieldWidth(): number {
    if (this._ownMatchSideConfigStatus != null && this._ownMatchSideConfigStatus.Settings != null)
      return this._ownMatchSideConfigStatus.Settings.BattleFieldWidth;
    return 0;
  }

  private _gridCells: { Coord: game.Coord, ShipType: game.ShipType }[][]; // TODO: create ad-hoc type
  public get Cells() { return this._gridCells; }

  public get IsConfigNeeded(): boolean { return this._ownMatchSideConfigStatus != null && this._ownMatchSideConfigStatus.IsConfigNeeded }

  private _canRandomize: boolean = false;
  public get CanRandomize(): boolean { return this._canRandomize; }

  private _canSubmitConfig: boolean = false;
  public get CanSubmitConfig(): boolean { return this._canSubmitConfig && this.IsConfigNeeded; }

  private rebuildGridCells() {
    if (this._gridCells == null) {
      this._gridCells = new Array(this._ownMatchSideConfigStatus.Settings.BattleFieldWidth);
      for (let x = 0; x < this._ownMatchSideConfigStatus.Settings.BattleFieldWidth; x++) {
        this._gridCells[x] = new Array(this._ownMatchSideConfigStatus.Settings.BattleFieldHeight);
        for (let y = 0; y < this._ownMatchSideConfigStatus.Settings.BattleFieldHeight; y++) {
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

    this.rebuildGridCells();

    let sortedShipsTypesToPlace: game.ShipType[] = [];
    let shipTypeToPlace: game.ShipType;
    let rx: number;
    let ry: number;
    let rOrient: game.Orientation;
    let rPlacement: game.ShipPlacement;

    for (let avShip of this._ownMatchSideConfigStatus.Settings.ShipTypeAvailabilities) {
      for (let i = 0; i < avShip.Count; i++) {
        sortedShipsTypesToPlace.push(avShip.ShipType);
      }
    }
    sortedShipsTypesToPlace = sortedShipsTypesToPlace.sort(); // sort from smallest to largest, so pop() will extract the largest

    while ((shipTypeToPlace = sortedShipsTypesToPlace.pop()) != null) {

      do {
        rOrient = utils.getRandomBoolean() ? game.Orientation.Vertical : game.Orientation.Horizontal;
        do {
          rx = utils.getRandomInt(0, this._ownMatchSideConfigStatus.Settings.BattleFieldWidth - (rOrient == game.Orientation.Horizontal ? shipTypeToPlace : 1));
          ry = utils.getRandomInt(0, this._ownMatchSideConfigStatus.Settings.BattleFieldHeight - (rOrient == game.Orientation.Vertical ? shipTypeToPlace : 1));
        } while (this._gridCells[rx][ry].ShipType != game.ShipType.NoShip);

        rPlacement = new game.ShipPlacement(shipTypeToPlace, new game.Coord(rx, ry), rOrient);

      } while (!game.FleetValidator.isValidShipPlacement(rPlacement, this._shipPlacements, this._ownMatchSideConfigStatus.Settings));

      this._shipPlacements.push(rPlacement);
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

  public submitMatchConfig(): void {

    this._canSubmitConfig = this._canRandomize = false;

    // TODO: handle no resposne
    this._gameService
      .configMatch(this._matchId, this._shipPlacements)
      .subscribe(
        response => {
          if (response.HasError) {
            console.log(response.ErrorMessage);
            this._canSubmitConfig = this._canRandomize = true;
          }
          else {
            if (!response.Content) {
              console.log("Match config failed");
            }
            else {
              this._ownMatchSideConfigStatus = response.Content;
              this._whenIsConfigNeededChanged.next(this._ownMatchSideConfigStatus.IsConfigNeeded);
              this._canSubmitConfig = this._canRandomize = this._ownMatchSideConfigStatus.IsConfigNeeded;

              if (!this._ownMatchSideConfigStatus.IsConfigNeeded) {
                this._whenIsConfigNeededChanged.complete();
              }
            }
          }
        },
        (error: HttpErrorResponse) => {
          switch (error.status) {

            case httpStatusCodes.LOCKED:
              console.log("Match config failed: config is locked");
              this._ownMatchSideConfigStatus.IsConfigNeeded = false;
              this._whenIsConfigNeededChanged.next(true);
              this._whenIsConfigNeededChanged.complete();
              break;

            default:
              console.log("Unhandled response status code");
          }
        });
  }

  ngOnInit(): void {
    // console.log("ngOnInit");
    this.updateMatchConfigStatus();
  }

  private updateMatchConfigStatus() {

    // TODO: handle no resposne
    // TODO: get config info only, anche determine at ngOnInit if it's visible or not
    this._gameService
      .getMatchConfigStatus(this._matchId)
      .subscribe(
        (response) => {
          if (response.HasError) {
            // TODO: handle
            console.log(response.ErrorMessage);
          }
          else if (!response.Content) {
            // TODO: handle
            console.log("The server returned null");
          }
          else {
            this._ownMatchSideConfigStatus = response.Content;
            this._whenIsConfigNeededChanged.next(this._ownMatchSideConfigStatus.IsConfigNeeded);

            if (this._ownMatchSideConfigStatus.IsConfigNeeded)
              this.randomizeFleet();
            else
              this._whenIsConfigNeededChanged.complete();
          }
        },
        (error: HttpErrorResponse) => {
          // TODO: handle
        });
  }
}