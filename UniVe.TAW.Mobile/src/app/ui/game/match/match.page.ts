import { Component, OnInit, Input, Output, OnDestroy, ViewChild } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

import * as identityDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as net from '../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../assets/unive.taw.webservice/infrastructure/game';
import { AuthService } from '../../../services/auth.service';
import * as http from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import Events from '../../../../assets/unive.taw.webservice/application/Events';
import { ToastController, Tabs, AlertController } from '@ionic/angular';
import { observe } from 'rxjs-observe';
import { Observable, Subscription } from 'rxjs';
import { OwnFieldControllerComponent } from './own-field-controller/own-field-controller.component';
import { EnemyFieldControllerComponent } from './enemy-field-controller/enemy-field-controller.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss']
})
export class MatchPage implements OnInit, OnDestroy {

  private readonly _matchId: string;
  private readonly _subscriptions: Subscription[] = [];
  private _whenOwnFieldTurnEndedSubscription: Subscription;
  private _whenEnemyFieldTurnEndedSubscription: Subscription;

  private _matchStartedEventKey: string;
  private _matchCanceledEventKey: string;

  private _matchInfoObservation: {
    observables: {
      [K in keyof gameDTOs.IMatchDto]: gameDTOs.IMatchDto[K] extends (...args: infer U) => any ? Observable<U> : Observable<gameDTOs.IMatchDto[K]>;
    };
    proxy: gameDTOs.IMatchDto;
  };

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _toastController: ToastController,
    private readonly _alertController: AlertController) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  @ViewChild("_tabs")
  private readonly _tabs: Tabs;

  private _ownFieldController: OwnFieldControllerComponent;
  @ViewChild("OwnFieldController")
  private set OwnFieldController(value: OwnFieldControllerComponent) {
    this._ownFieldController = value;
    if (!!this._ownFieldController) {
      if (!this._whenOwnFieldTurnEndedSubscription) {
        this._whenOwnFieldTurnEndedSubscription = this._ownFieldController.WhenTurnEnded.subscribe(async (e) => {
          if (!!this.MatchInfo.EndDateTime)
            await this.showMatchEndedAlert();
        });
        this._subscriptions.push(this._whenOwnFieldTurnEndedSubscription);
      }
    }
  };

  private _enemyFieldController: EnemyFieldControllerComponent;
  @ViewChild("EnemyFieldController")
  private set EnemyFieldController(value: EnemyFieldControllerComponent) {
    this._enemyFieldController = value;
    if (!!this._enemyFieldController) {
      if (!this._whenEnemyFieldTurnEndedSubscription) {
        this._whenEnemyFieldTurnEndedSubscription = this._enemyFieldController.WhenTurnEnded.subscribe(async (e) => {
          if (!!this.MatchInfo.EndDateTime)
            await this.showMatchEndedAlert();
        });
        this._subscriptions.push(this._whenEnemyFieldTurnEndedSubscription);
      }
    }
  };

  private _matchInfo: gameDTOs.IMatchDto;
  public get MatchInfo() { return this._matchInfo; }

  public get IsMatchConfigVisible() { return !!this._matchInfo && !this._matchInfo.OwnSide.IsConfigured; }
  public get AreFieldsVisible() { return !!this._matchInfo ? !!this._matchInfo.StartDateTime : false; }
  public get IsWaitingForEnemyToConfig() { return !!this._matchInfo ? !this._matchInfo.StartDateTime && this._matchInfo.OwnSide.IsConfigured : false; }
  public get IsChatVisible() { return !!this._matchInfo; }

  public get EnemyId(): string { return !!this._matchInfo ? this._matchInfo.EnemySide.Player.Id : undefined; }
  public get EnemyUsername(): string { return !!this._matchInfo ? this._matchInfo.EnemySide.Player.Username : undefined; }

  public get IsWinnerBannerVisible(): boolean { return !!this._matchInfo && !!this._matchInfo.EndDateTime; }
  public get DidIWin(): boolean { return (!!this._matchInfo && !!this._matchInfo.EndDateTime) ? this._matchInfo.DidIWin : undefined; }


  ngOnInit() {

    if (!this._matchId) {
      this._router.navigate([ViewsRoutingKeys.Root]);
    }
    else {
      this._gameService.getMatchStatus(this._matchId)
        .subscribe(
          async response => {

            if (response.ErrorMessage) {
              console.log(response.ErrorMessage);
            }
            else if (!response.Content) {
              console.log("getOwnSideMatchStatus returned null");
            }
            else {
              this._matchInfo = response.Content;

              // this._matchInfoObservation = observe<gameDTOs.IMatchDto>(this._matchInfo);
              // this._subscriptions.push(this._matchInfoObservation.observables.EndDateTime.subscribe(

              // ));

              if (!this.MatchInfo.StartDateTime) {

                this._matchStartedEventKey = Events.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, Events.MatchStarted);
                this._socketIOService.once(
                  this._matchStartedEventKey,
                  (matchStartedEvent: gameDTOs.IMatchStartedEventDto) => {
                    this._matchInfo.StartDateTime = matchStartedEvent.StartDateTime;
                    this._matchInfo.OwnSide.Cells = matchStartedEvent.OwnCells;
                    this._matchInfo.EnemySide.Cells = matchStartedEvent.EnemyCells;
                    this._matchInfo.CanFire = matchStartedEvent.CanFire;

                    if (this.MatchInfo.CanFire)
                      this._tabs.select("enemy-field-controller-tab");
                    else
                      this._tabs.select("own-field-controller-tab");

                  });
              }
              if (!this._matchInfo.EndDateTime) {

                this._socketIOService.once(
                  Events.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, Events.MatchCanceled),
                  async (event: any) => {
                    const alert = await this._alertController.create({
                      buttons: [{
                        text: "Ok",
                        handler: () => this._router.navigate([ViewsRoutingKeys.Root])
                      }],
                      message: "This match has been canceled." + "<br>" + "It won't be calculated in your match history.",
                      header: "Match canceled"
                    });
                    await alert.present();
                  });
              }

              if (this.IsMatchConfigVisible || this.IsWaitingForEnemyToConfig) {
                this._tabs.select("fleet-configurator-tab");
              } else if (this.AreFieldsVisible) {
                if (this.MatchInfo.CanFire)
                  this._tabs.select("enemy-field-controller-tab");
                else
                  this._tabs.select("own-field-controller-tab");
              }
            }
          },
          (error: http.HttpErrorResponse) => {
            this._router.navigate([ViewsRoutingKeys.Root]);
          });
    }
  }

  private async showMatchEndedAlert() {
    const alert = await this._alertController.create({
      buttons: [{
        text: "Play again",
        handler: () => this._router.navigate([ViewsRoutingKeys.Root])
      }],
      message: "You " + (this.DidIWin ? "WON" : "LOST"),
      header: "Match ended"
    });
    await alert.present();
  }

  // private async showMatchEndedToast() {
  //   const toast = await this._toastController.create({
  //     showCloseButton: true,
  //     closeButtonText: "Play again",
  //     position: "bottom",
  //     message: "You " + (this.DidIWin ? "WON" : "LOST")
  //   });
  //   toast.onDidDismiss().then(() => {
  //     setTimeout(() => {
  //       this._router.navigate([ViewsRoutingKeys.MatchFinder]);
  //     }, 100);
  //   });
  //   toast.present();
  // }

  ngOnDestroy(): void {

    for (let subscription of this._subscriptions) {
      subscription.unsubscribe();
    }

    if (this._matchStartedEventKey != null) {
      this._socketIOService.removeListener(this._matchStartedEventKey);
      this._matchStartedEventKey = null;
    }
    if (this._matchCanceledEventKey != null) {
      this._socketIOService.removeListener(this._matchCanceledEventKey);
      this._matchCanceledEventKey = null;
    }
  }

}