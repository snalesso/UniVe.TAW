import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import * as identity from '../assets/unive.taw.webservice/infrastructure/identity';
import ViewsRoutingKeys from './ViewsRoutingKeys';
import * as moment from 'moment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private _accountBannedEventKey: string;
  private _accountDeletedEventKey: string;
  private _accountRolesUpdatedEventKey: string;

  constructor(
    public _electronService: ElectronService,
    private _translate: TranslateService,
    private readonly _router: Router,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _authService: AuthService) {

    this._translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (this._electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', this._electronService.ipcRenderer);
      console.log('NodeJS childProcess', this._electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  private _isLogged: boolean;
  public get IsLogged() { return this._authService.IsLogged; }

  private activateSubscriptions() {

    if (this._authService.IsLogged) {

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.BanUpdated),
        (userBannedUntil: Date) => {
          console.log("BanUpdated received");
          if (userBannedUntil) {
            this._authService.logout();
            alert("You have been banned until " + moment(userBannedUntil).format("DD/MM/YYYY HH:mm:ss"));
            this._router.navigate([ViewsRoutingKeys.Root]);
          }
        });
      console.log("subscribed to BanUpdated");

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.UserDeleted),
        () => {
          console.log("UserDeleted received");
          this._authService.logout();
          //alert("Your account has been deleted!");
          this._router.navigate([ViewsRoutingKeys.Root]);
        });
      console.log("subscribed to UserDeleted");

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.RolesUpdated),
        (newRole: identity.UserRoles) => {
          console.log("RolesUpdated received");
          location.reload();
        });
      console.log("subscribed to RolesUpdated");
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
    this.activateSubscriptions();
  }

  ngOnDestroy(): void {
    this.removeSubscriptions();
  }

}