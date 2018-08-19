import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import Constants from '../../../../services/constants';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as interactjs from 'interactjs';
import * as utils from '../../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import * as $ from 'jquery';

@Component({
  selector: 'app-fleet-configurator',
  templateUrl: './fleet-configurator.component.html',
  styleUrls: ['./fleet-configurator.component.css']
})
export class FleetConfiguratorComponent implements OnInit, AfterViewInit, AfterContentInit {

  private _showCoords: boolean = false;
  public get ShowCoords(): boolean { return this._showCoords; }
  public set ShowCoords(value: boolean) { this._showCoords = value; }

  private readonly _matchId: string;
  //private _placeableShipTypes: game.ShipType[] = [];
  //private _shipPlacements: game.ShipPlacement[] = [];
  private _shipsMappings: { shipPlacement: game.ShipPlacement, uiShip: HTMLElement }[] = [];
  public ShipsLog: string[];

  private _settings: game.MatchSettings;
  public get Settings(): game.MatchSettings {
    return this._settings;
  }
  public get BattleFieldGridWidth(): number {
    return this._settings.BattleFieldSettings.BattleFieldWidth + (this.ShowCoords ? 1 : 0);
  }
  public get BattleFieldGridHeight(): number {
    return this._settings.BattleFieldSettings.BattleFieldHeight + (this.ShowCoords ? 1 : 0);
  }
  private _dummyCols: number[] = [];
  public get BattleFieldGridDummyCols(): number[] {
    return this._dummyCols;
  }
  private _dummyRows: number[] = [];
  public get BattleFieldGridDummyRows(): number[] {
    return this._dummyRows;
  }
  private _bfchp: number;
  public get BattleFieldGridCellHeightPercent() {
    return this._bfchp;
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService) {
    // const sp = new game.ShipPlacement(game.ShipType.Carrier, new game.Coord(6, 3), game.ShipOrientation.Vertical);
    // const x = game.FleetValidator.getShipPlacementCoords(sp);

    // const
    //   c1 = new game.Coord(5, 5),
    //   c2 = new game.Coord(4, 5),
    //   c3 = new game.Coord(4, 4),
    //   c4 = new game.Coord(5, 4);

    // console.log(game.FleetValidator.getCoordsDistance(c1, c2));
    // console.log(game.FleetValidator.getCoordsDistance(c1, c3));
    // console.log(game.FleetValidator.getCoordsDistance(c1, c4));
    // console.log(game.FleetValidator.getCoordsDistance(c4, c3));
  }

  private updateGridSettings(): void {
    this._dummyCols = Array.apply(null, { length: this.BattleFieldGridWidth }).map(Number.call, Number);
    this._dummyRows = Array.apply(null, { length: this.BattleFieldGridHeight }).map(Number.call, Number);
    this._bfchp = 100 / this.BattleFieldGridWidth;
  }

  private cleanFleetConfig() {

    this._shipsMappings.forEach(sm => {
      // TODO: this can be simply moved instead regen
      if (sm.uiShip != null)
        sm.uiShip.remove();
    });

    this._shipsMappings = [];
    this.ShipsLog = [];
  }

  public RandomCoordsCreated: number = 0;

  public randomizeFleet() {
    this.cleanFleetConfig();
    //this.rebuildBattleFieldGrid();

    // const cells: game_client.ClientSideBattleFieldCell_Owner[][] = [];
    // for (let x = 0; x < this._settings.BattleFieldSettings.BattleFieldWidth; x++) {
    //   cells[x] = [];
    //   for (let y = 0; y < this._settings.BattleFieldSettings.BattleFieldHeight; y++) {
    //     cells[x][y] = new game_client.ClientSideBattleFieldCell_Owner(game.ShipType.NoShip);
    //   }
    // }
    const availableCoords: boolean[][] = [];
    for (let x = 0; x < this._settings.BattleFieldSettings.BattleFieldWidth; x++) {
      availableCoords[x] = [];
      for (let y = 0; y < this._settings.BattleFieldSettings.BattleFieldHeight; y++) {
        availableCoords[x][y] = true;
      }
    }

    let isValidPlacement: boolean = false;
    let placeableShipTypes: game.ShipType[] = [];
    let shipTypeToPlace: game.ShipType;
    let rx: number;
    let ry: number;
    let rCoord: game.Coord;
    let rOrient: game.ShipOrientation;
    let rPlacement: game.ShipPlacement;

    this._settings.AvailableShips.forEach(avShip => {
      for (let i = 0; i < avShip.Count; i++) {
        placeableShipTypes.push(avShip.ShipType);
      }
    });
    placeableShipTypes = placeableShipTypes.sort(); // sort from smallest to largest, so pop() will extract the largest

    this.RandomCoordsCreated = 0;

    while ((shipTypeToPlace = placeableShipTypes.pop()) != null) {

      isValidPlacement = false;

      while (!isValidPlacement) {
        rOrient = utils.getRandomBoolean() ? game.ShipOrientation.Vertical : game.ShipOrientation.Horizontal;
        do {
          rx = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldWidth - (rOrient == game.ShipOrientation.Horizontal ? shipTypeToPlace : 1));
          ry = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldHeight - (rOrient == game.ShipOrientation.Vertical ? shipTypeToPlace : 1));
          this.RandomCoordsCreated++;
        } while (!(availableCoords[rx][ry]));

        rCoord = new game.Coord(rx, ry);
        availableCoords[rx][ry] = false;

        rPlacement = new game.ShipPlacement(shipTypeToPlace, rCoord, rOrient);

        isValidPlacement = game.FleetValidator.validateShipPlacement(rPlacement, this._shipsMappings.map(sm => sm.shipPlacement), this._settings);
      }

      this._shipsMappings.push({ shipPlacement: rPlacement, uiShip: null /*document.createElement("div")*/ });
    }

    this.ShipsLog = this._shipsMappings
      .map(sm => sm.shipPlacement)
      .map(sp => sp.Type + " @ (" + sp.Coord.X + ", " + sp.Coord.Y + ") " + (sp.Orientation == game.ShipOrientation.Horizontal ? "H" : "V"));

    this.drawFleet();
  }

  private drawFleet(): void {

    // clean shown ships
    $(".bf-grid-cell").removeClass("ship");

    this._shipsMappings.forEach(sm => {
      const sps = game.FleetValidator.getShipPlacementCoords(sm.shipPlacement);
      sps.forEach(coord => {
        const cell = $(".bf-grid-cell[data-x=" + coord.X + "][data-y=" + coord.Y + "]");
        cell.addClass("ship");
      });
    });
  }

  ngOnInit(): void {
    // console.log("ngOnInit");

    // $(document).ready(() => {
    //   console.log("DOM ready");
    // });

    // this.gameService
    //   .getNewMatchSettings(localStorage.getItem(Constants.AccessTokenKey))
    //   .subscribe(response => {
    //     if (response.HasError) {
    //       console.log(response.ErrorMessage);
    //     }
    //     else if (!response.Content) {
    //       console.log("The server returned a null match dto!");
    //     }
    //     else {
    //       this._settings = response.Content;
    //       this.configureInteractJs();
    //     }
    //   });

    this._settings = new game.MatchSettings(); // fakes to test
    this.updateGridSettings();
  }

  ngAfterViewInit(): void {
    // console.log("ngAfterViewInit");
    // console.log(document.readyState);

    this.randomizeFleet();
    // this.configureInteractJs();
  }
  ngAfterContentInit(): void {
    //console.log("ngAfterContentInit");
  }

  // private startPos: any = null;

  // private configureInteractJs(): void {

  //   interactjs('.placeableShip')
  //     .draggable({
  //       onmove: function (event: interactjs.InteractEvent) {
  //         var target = event.target,
  //           x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  //           y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  //         target.style.webkitTransform =
  //           target.style.transform =
  //           'translate(' + x + 'px, ' + y + 'px)';

  //         target.setAttribute('data-x', x);
  //         target.setAttribute('data-y', y);
  //       },
  //       inertia: false,
  //       restrict: {
  //         endOnly: true,
  //         elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  //       },
  //       snap: {
  //         range: Infinity,
  //         // targets: interactjs.createSnapGrid({})
  //         // endOnly: true
  //       }
  //     })
  //     // .on('dragstart', function (event) {
  //     //   if (!startPos) {
  //     //     var rect = interactjs.getElementRect(event.target);

  //     //     // record center point when starting the very first a drag
  //     //     startPos = {
  //     //       x: rect.left + rect.width / 2,
  //     //       y: rect.top + rect.height / 2
  //     //     }
  //     //   }

  //     //   // snap to the start position
  //     //   event.interactable.snap({ anchors: [startPos] });
  //     // })
  //     ;

  //   interactjs('.dropzone')
  //     // enable draggables to be dropped into this
  //     .dropzone({
  //       overlap: 'center',
  //       accept: '.draggableShip'
  //     })
  //     //         // listen for drop related events
  //     // .on('dragenter', function (event: interactjs.InteractEvent) {
  //     //   var dropRect = interactjs.(event.target),
  //     //     dropCenter = {
  //     //       x: dropRect.left + dropRect.width / 2,
  //     //       y: dropRect.top + dropRect.height / 2
  //     //     };

  //     //   event.draggable.snap({
  //     //     anchors: [dropCenter]
  //     //   });

  //     //   var draggableElement = event.relatedTarget,
  //     //     dropzoneElement = event.target;

  //     //   // feedback the possibility of a drop
  //     //   dropzoneElement.classList.add('drop-target');
  //     //   draggableElement.classList.add('can-drop');
  //     // })
  //     //         .on('dragleave', function (event) {
  //     //           event.draggable.snap(false);

  //     //           // when leaving a dropzone, snap to the start position
  //     //           event.draggable.snap({
  //     //             targets: [startPos]
  //     //           });
  //     //           // remove the drop feedback style
  //     //           event.target.classList.remove('drop-target');
  //     //           event.relatedTarget.classList.remove('can-drop');
  //     //         })
  //     //         .on('dropactivate', function (event) {
  //     //           // add active dropzone feedback
  //     //           event.target.classList.add('drop-active');
  //     //         })
  //     //         .on('dropdeactivate', function (event) {
  //     //           // remove active dropzone feedback
  //     //           event.target.classList.remove('drop-active');
  //     //           event.target.classList.remove('drop-target');
  //     //         });
  //     //     }
  //     // })
  //     ;
  // }

}
