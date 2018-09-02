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
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
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

  private _shipPlacements: game.ShipPlacement[] = [];

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _gameService: GameService,
    private readonly _authService: AuthService) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.MatchId);
  }

  private _whenIsConfigNeededChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Output()
  public get WhenIsConfigNeededChanged(): Observable<boolean> { return this._whenIsConfigNeededChanged.asObservable(); }

  // private _whenStatusChanged = new BehaviorSubject<string>(null);
  // @Output()
  // public get WhenStatusChanged(): Observable<string> { return this._whenStatusChanged.asObservable(); }

  private readonly _matchId: string;
  //public get MatchId() { return this._matchId; }

  private _ownMatchSideConfigStatus: DTOs.IOwnMatchSideConfigStatus;
  public get OwnMatchSideConfigStatus(): DTOs.IOwnMatchSideConfigStatus { return this._ownMatchSideConfigStatus; }

  public get BattleFieldWidth(): number {
    if (this.OwnMatchSideConfigStatus && this.OwnMatchSideConfigStatus.Settings)
      return this.OwnMatchSideConfigStatus.Settings.BattleFieldWidth;
    return 0;
  }

  private _gridCells: { Coord: game.Coord, ShipType: game.ShipType }[][]; // TODO: create ad-hoc type
  public get Cells() { return this._gridCells; }

  public get IsConfigNeeded(): boolean { return this._ownMatchSideConfigStatus && this._ownMatchSideConfigStatus.IsConfigNeeded }

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

    //this._whenStatusChanged.next("Randomizing ...");

    this.rebuildGridCells();

    let sortedShipsTypesToPlace: game.ShipType[] = [];
    let shipTypeToPlace: game.ShipType;
    let rx: number;
    let ry: number;
    let rOrient: game.ShipOrientation;
    let rPlacement: game.ShipPlacement;

    for (let avShip of this._ownMatchSideConfigStatus.Settings.ShipTypeAvailabilities) {
      for (let i = 0; i < avShip.Count; i++) {
        sortedShipsTypesToPlace.push(avShip.ShipType);
      }
    }
    sortedShipsTypesToPlace = sortedShipsTypesToPlace.sort(); // sort from smallest to largest, so pop() will extract the largest

    while ((shipTypeToPlace = sortedShipsTypesToPlace.pop()) != null) {

      do {
        rOrient = utils.getRandomBoolean() ? game.ShipOrientation.Vertical : game.ShipOrientation.Horizontal;
        do {
          rx = utils.getRandomInt(0, this._ownMatchSideConfigStatus.Settings.BattleFieldWidth - (rOrient == game.ShipOrientation.Horizontal ? shipTypeToPlace : 1));
          ry = utils.getRandomInt(0, this._ownMatchSideConfigStatus.Settings.BattleFieldHeight - (rOrient == game.ShipOrientation.Vertical ? shipTypeToPlace : 1));
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

    //this._whenStatusChanged.next("Randomization completed!");

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
          else if (!response.Content) {
            console.log("Match config failed");
            this._canSubmitConfig = this._canRandomize = true;
          }
          else {
            this._whenIsConfigNeededChanged.next(false);
            this._whenIsConfigNeededChanged.complete();
          }
        },
        (error: HttpErrorResponse) => {
          switch (error.status) {

            case httpStatusCodes.LOCKED:
              console.log("Match config failed: config is locked");
              this._whenIsConfigNeededChanged.next(false);
              this._whenIsConfigNeededChanged.complete();
              break;

            default:
              console.log("Unhandled response status code");
          }
        });
  }

  ngOnInit(): void {
    // console.log("ngOnInit");
    this.getMatchConfigStatus();
  }

  private getMatchConfigStatus(maxRetries: number = 1) {

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
            console.log("The server returned a null match dto!");
          }
          else {
            this._ownMatchSideConfigStatus = response.Content;

            this._whenIsConfigNeededChanged.next(this.OwnMatchSideConfigStatus.IsConfigNeeded);

            if (!this.OwnMatchSideConfigStatus.IsConfigNeeded)
              this._whenIsConfigNeededChanged.complete();
            else
              this.randomizeFleet();
          }
        },
        (error: HttpErrorResponse) => {
          // TODO: handle

          // switch (error.status) {
          //   case httpStatusCodes.UNAUTHORIZED: {
          //     // const credentials: DTOs.ILoginCredentials = {
          //     //   Username: localStorage.getItem(ServiceConstants.AccessCredentials_Username),
          //     //   Password: localStorage.getItem(ServiceConstants.AccessCredentials_Password)
          //     // };
          //     this.authService.login(credentials).subscribe(
          //       response => {
          //         if (response.HasError) {
          //           // TODO: handle
          //         }
          //         else if (!response.Content) {
          //           // TODO: handle
          //           console.log("The server returned a null match dto!");
          //         }
          //         else {
          //           localStorage.setItem(ServiceConstants.AccessTokenKey, response.Content);
          //         }

          //         if (maxRetries > 0) {
          //           this.getSettings(--maxRetries);
          //         }
          //       },
          //       (error: HttpErrorResponse) => {
          //         this.router.navigate([ViewsRoutingKeys.Login])
          //       });
          //   }
          //     break;

          //   default:
          //     console.log("Unhandled response code");
          // }
        });
  }
}