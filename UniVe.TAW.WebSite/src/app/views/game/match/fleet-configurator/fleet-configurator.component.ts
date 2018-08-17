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
import * as $ from 'jquery';

@Component({
  selector: 'app-fleet-configurator',
  templateUrl: './fleet-configurator.component.html',
  styleUrls: ['./fleet-configurator.component.css']
})
export class FleetConfiguratorComponent implements OnInit {

  private readonly _matchId: string;
  private _placeableShipTypes: game.ShipType[] = [];
  private _shipPlacements: game.ShipPlacement[] = [];
  private _shipsMappings: { ship: game.ShipPlacement, uiShip: HTMLElement }[] = [];

  private _settings: game.MatchSettings;
  public get Settings(): game.MatchSettings {
    return this._settings;
  }

  public get BattleFieldWidth(): number {
    return this._settings.BattleFieldSettings.BattleFieldWidth;
  }
  public get BattleFieldHeight(): number {
    return this._settings.BattleFieldSettings.BattleFieldHeight;
  }
  private _dummyCols: boolean[] = [];
  public get BattleFieldDummyCols(): boolean[] {
    return this._dummyCols;
  }
  private _dummyRows: boolean[] = [];
  public get BattleFieldDummyRows(): boolean[] {
    return this._dummyRows;
  }
  // public get CellWidthPercent() {
  //   return 100 / this.BattleFieldWidth;
  // }
  private _cellHeightPercent: number;
  public get CellHeightPercent() {
    return 10;
  }

  public get Cells(): game.ShipPlacement[] {
    return null;
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly gameService: GameService) {

    // window.addEventListener("resize", function (ev: UIEvent) {
    //   $(".bf-grid-cell").each((i, cell) => {
    //     const anyCell = (cell as any);
    //     anyCell.height(anyCell.width);
    //   });
    // });
  }

  private resetField(): void {
    this._dummyCols = new Array(this.BattleFieldWidth).fill(true);
    this._dummyRows = new Array(this.BattleFieldHeight).fill(true);
    this._cellHeightPercent = 100 / this.BattleFieldWidth;
  }

  private resetFleetConfig() {
    this._shipsMappings.forEach(sm => {
      // TODO: this can be simply moved instead regen
      if (sm.uiShip != null)
        sm.uiShip.remove();
    });

    this._shipsMappings = [];
    this._placeableShipTypes = [];

    this._settings.AvailableShips.forEach(avShip => {
      for (let i = 0; i < avShip.Count; i++) {
        this._placeableShipTypes.push(avShip.ShipType);
      }
    });
    this._placeableShipTypes = this._placeableShipTypes.sort(); // sort from smallest to largest
  }

  public randomizeFleet() {
    this.resetFleetConfig();

    let placed: game.ShipPlacement[] = [];

    let isValidPlacement: boolean = false;

    for (let i = 0; i < this._placeableShipTypes.length; i++) {
      isValidPlacement = false;
      let shipTypeToPlace = this._placeableShipTypes.pop();
      let rx: number;
      let ry: number;
      let rCoord: game.Coord;
      let rOrient: game.ShipOrientation;
      let rPlacement: game.ShipPlacement;

      while (!isValidPlacement) {
        rx = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldWidth);
        ry = utils.getRandomInt(0, this._settings.BattleFieldSettings.BattleFieldHeight);
        rCoord = new game.Coord(rx, ry);
        rOrient = utils.getRandomBoolean() ? game.ShipOrientation.Vertical : game.ShipOrientation.Horizontal;
        rPlacement = new game.ShipPlacement(shipTypeToPlace, rCoord, rOrient);

        isValidPlacement = game.FleetValidator.validateShipPlacement(rPlacement, placed);
      }

      this._shipsMappings.push({ ship: rPlacement, uiShip: null /*document.createElement("div")*/ })
    }
  }

  ngOnInit() {
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

    this.resetField();
    this.randomizeFleet();
    // this.configureInteractJs();
  }

  private startPos: any = null;

  private configureInteractJs(): void {

    interactjs('.placeableShip')
      .draggable({
        onmove: function (event: interactjs.InteractEvent) {
          var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          target.style.webkitTransform =
            target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        },
        inertia: false,
        restrict: {
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        snap: {
          range: Infinity,
          // targets: interactjs.createSnapGrid({})
          // endOnly: true
        }
      })
      // .on('dragstart', function (event) {
      //   if (!startPos) {
      //     var rect = interactjs.getElementRect(event.target);

      //     // record center point when starting the very first a drag
      //     startPos = {
      //       x: rect.left + rect.width / 2,
      //       y: rect.top + rect.height / 2
      //     }
      //   }

      //   // snap to the start position
      //   event.interactable.snap({ anchors: [startPos] });
      // })
      ;

    interactjs('.dropzone')
      // enable draggables to be dropped into this
      .dropzone({
        overlap: 'center',
        accept: '.draggableShip'
      })
      //         // listen for drop related events
      // .on('dragenter', function (event: interactjs.InteractEvent) {
      //   var dropRect = interactjs.(event.target),
      //     dropCenter = {
      //       x: dropRect.left + dropRect.width / 2,
      //       y: dropRect.top + dropRect.height / 2
      //     };

      //   event.draggable.snap({
      //     anchors: [dropCenter]
      //   });

      //   var draggableElement = event.relatedTarget,
      //     dropzoneElement = event.target;

      //   // feedback the possibility of a drop
      //   dropzoneElement.classList.add('drop-target');
      //   draggableElement.classList.add('can-drop');
      // })
      //         .on('dragleave', function (event) {
      //           event.draggable.snap(false);

      //           // when leaving a dropzone, snap to the start position
      //           event.draggable.snap({
      //             targets: [startPos]
      //           });
      //           // remove the drop feedback style
      //           event.target.classList.remove('drop-target');
      //           event.relatedTarget.classList.remove('can-drop');
      //         })
      //         .on('dropactivate', function (event) {
      //           // add active dropzone feedback
      //           event.target.classList.add('drop-active');
      //         })
      //         .on('dropdeactivate', function (event) {
      //           // remove active dropzone feedback
      //           event.target.classList.remove('drop-active');
      //           event.target.classList.remove('drop-target');
      //         });
      //     }
      // })
      ;
  }

}