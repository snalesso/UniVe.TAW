import { Component, OnInit, Input, Output, OnDestroy, ViewChild } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../assets/scripts/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../assets/scripts/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import * as DTOs from '../../../../assets/scripts/unive.taw.webservice/application/DTOs';
import * as net from '../../../../assets/scripts/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../assets/scripts/unive.taw.webservice/infrastructure/game';
import { AuthService } from '../../../services/auth.service';
import * as http from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../assets/scripts/unive.taw.webservice/application/services/ServiceEventKeys';
import { ToastController, Tabs, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss']
})
export class MatchPage implements OnInit, OnDestroy {

  private readonly _matchId: string;

  private _matchStatus: DTOs.IOwnSideMatchStatus;
  private _matchStartedEventKey: string;
  private _matchEndedEventKey: string;

  constructor(
    private readonly _gameService: GameService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _toastController: ToastController,
    private readonly alertController: AlertController
  ) {

    this._matchId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.matchId);
  }

  @ViewChild("_tabs")
  private readonly _tabs: Tabs;

  //public get EnemyUsername(){return this._matchStatus != null ? this._matchStatus.}

  public get IsWaitingForEnemyToConfig() { return this._matchStatus && !this._matchStatus.IsConfigNeeded && !this._matchStatus.IsMatchStarted; }

  public get IsMatchSetupVisible() { return this._matchStatus && this._matchStatus.IsConfigNeeded; }

  public get AreTurnControllersVisible() { return this._matchStatus && this._matchStatus.IsMatchStarted; }

  public get EnemyId(): string { return this._matchStatus && this._matchStatus.Enemy ? this._matchStatus.Enemy.Id : null; }

  public get EnemyUsername(): string { return this._matchStatus && this._matchStatus.Enemy ? this._matchStatus.Enemy.Username : null; }

  public get IsMatchEnded(): boolean { return this._matchStatus ? this._matchStatus.EndDateTime != null : undefined; }

  public get DidIWin(): boolean { return (this._matchStatus && this._matchStatus.EndDateTime) ? this._matchStatus.DidIWin : false; }

  public handleWhenIsConfigNeededChanged(value: boolean) {
    if (this._matchStatus)
      this._matchStatus.IsConfigNeeded = value;
  }

  ngOnInit() {

    if (!this._matchId) {
      this._router.navigate([ViewsRoutingKeys.Root]);
    }
    else {
      this._gameService.getOwnSideMatchStatus(this._matchId)
        .subscribe(
          async response => {

            if (response.HasError) {
              console.log(response.ErrorMessage);
            }
            else if (!response.Content) {
              console.log("getOwnSideMatchStatus returned null");
            }
            else {
              this._matchStatus = response.Content;

              if (!this._matchStatus.IsMatchStarted) {

                this._matchStartedEventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchStarted);
                this._socketIOService.once(
                  this._matchStartedEventKey,
                  (matchStartedEvent: DTOs.IMatchStartedEventDto) => {

                    this._matchStatus.IsMatchStarted = true;
                    this._matchStatus.DoIOwnMove = matchStartedEvent.InActionPlayerId == this._authService.LoggedUser.Id;

                    if (this._matchStatus.DoIOwnMove)
                      this._tabs.select("own-turn-controller-tab");
                    else
                      this._tabs.select("enemy-turn-controller-tab");

                  });
              }
              if (!this._matchStatus.EndDateTime) {

                this._matchEndedEventKey = ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchEnded);
                this._socketIOService.once(
                  this._matchEndedEventKey,
                  async (matchEndedEvent: DTOs.IMatchEndedEventDto) => {
                    if (this._matchStatus) {
                      this._matchStatus.EndDateTime = matchEndedEvent.EndDateTime;
                      this._matchStatus.DidIWin = (matchEndedEvent.WinnerId && matchEndedEvent.WinnerId == this._authService.LoggedUser.Id);
                      const toast = await this._toastController.create({
                        showCloseButton: true,
                        closeButtonText: "Play again",
                        position: "bottom",
                        message: "You " + (this.DidIWin ? "WON" : "LOST")
                      });
                      toast.onDidDismiss().then(() => {
                        setTimeout(() => {
                          this._router.navigate([ViewsRoutingKeys.MatchFinder]);
                        }, 100);
                      });
                      toast.present();
                    }
                  });
              }

              this._socketIOService.once(
                ServiceEventKeys.matchEventForUser(this._authService.LoggedUser.Id, this._matchId, ServiceEventKeys.MatchCanceled),
                async (event: any) => {
                  const alert = await this.alertController.create({
                    buttons: ["Ok"],
                    message: "This match has been canceled." + "<br>" + "It won't be calculated in your match history.",
                    header: "Match canceled"
                  });
                  await alert.present();
                  this._router.navigate(["/match-finder"]);
                });

              // //const x = await this._tabs.getSelected();
              //setTimeout(() => {
              if (this.IsMatchSetupVisible || this.IsWaitingForEnemyToConfig) {
                this._tabs.select("fleet-configurator-tab");
              } else if (this.AreTurnControllersVisible) {
                if (this._matchStatus.DoIOwnMove)
                  this._tabs.select("own-turn-controller-tab");
                else
                  this._tabs.select("enemy-turn-controller-tab");
              }
              //}, 200);
              // // console.log(x);
            }
          },
          (error: http.HttpErrorResponse) => {
            this._router.navigate(["/match-finder"]);
          });
    }
  }

  ngOnDestroy(): void {
    // TODO: removelistener rimuove le sottoscrizioni allo stesso evento per tutti? non è che ci siano altri sottoscritti ad un evento sottoscritto qui, qua viene rimosso e gli altri perdono le comunicazioni?
    if (this._matchStartedEventKey)
      this._socketIOService.removeListener(this._matchStartedEventKey);
    if (this._matchEndedEventKey)
      this._socketIOService.removeListener(this._matchEndedEventKey);
  }

}