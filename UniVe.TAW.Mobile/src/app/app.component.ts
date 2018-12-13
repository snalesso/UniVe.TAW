import { Component, OnDestroy, OnInit } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import * as ngxSocketIO from 'ngx-socket-io';
import { AuthService } from './services/auth.service';
import * as moment from 'moment';
import ServiceEventKeys from '../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import * as identity from '../assets/unive.taw.webservice/infrastructure/identity';
import ViewsRoutingKeys from './ViewsRoutingKeys';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  private _accountBannedEventKey: string;
  private _accountDeletedEventKey: string;
  private _accountRolesUpdatedEventKey: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private readonly _router: Router,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _authService: AuthService,
    private readonly alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  private _isLogged: boolean;
  public get IsLogged() { return this._authService.IsLogged; }

  public get LoggedUsername() { return this._authService.IsLogged ? this._authService.LoggedUser.Username : null; }

  public get LoggedUserId() { return this._authService.IsLogged ? this._authService.LoggedUser.Id : null; }

  private activateSubscriptions() {

    if (this._authService.IsLogged) {

      this._socketIOService.once(
        (this._accountBannedEventKey = ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.BanUpdated)),
        async (userBannedUntil: Date) => {
          if (userBannedUntil) {
            this._authService.logout();
            console.log("banned");
            const alert = await this.alertController.create({
              buttons: ["Ok"],
              message: "You have been banned until " + moment(userBannedUntil).format("DD/MM/YYYY HH:mm:ss") +
                "<br>" + "You will be logeed out.",
              header: "You got banned!"
            });
            await alert.present();
            //this._router.navigate([ViewsRoutingKeys.Root]);
          }
        });

      this._socketIOService.once(
        (this._accountDeletedEventKey = ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.UserDeleted)),
        async () => {
          this._authService.logout();
          console.log("account deleted");
          const alert = await this.alertController.create({
            buttons: ["Ok"],
            message: "Your account has been DELETED by the Admin! :O" + "<br>" + "WTF did you do??? BYE",
            header: "ACCOUNT DELETED!"
          });
          await alert.present();
          //this._router.navigate([ViewsRoutingKeys.Root]);
        });

      this._socketIOService.once(
        (this._accountRolesUpdatedEventKey = ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.RolesUpdated)),
        (newRole: identity.UserRoles) => {
          location.reload();
          console.log("roles updated");
        });
    }
  }

  private removeSubscriptions() {

    if (this._accountBannedEventKey) {
      this._socketIOService.removeListener(this._accountBannedEventKey);
      this._accountBannedEventKey = null;
    }
    if (this._accountDeletedEventKey) {
      this._socketIOService.removeListener(this._accountDeletedEventKey);
      this._accountDeletedEventKey = null;
    }
    if (this._accountRolesUpdatedEventKey) {
      this._socketIOService.removeListener(this._accountRolesUpdatedEventKey);
      this._accountRolesUpdatedEventKey = null;
    }
  }

  ngOnInit(): void {

    this._authService.WhenIsLoggedChanged.subscribe((isLogged) => {
      if (isLogged)
        this.activateSubscriptions();
      else
        this.removeSubscriptions();
    });
  }

  ngOnDestroy(): void {
    this.removeSubscriptions();
  }

}
