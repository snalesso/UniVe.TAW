import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import * as identity from '../assets/unive.taw.webservice/infrastructure/identity';
import { Router } from '@angular/router';
import * as moment from 'moment';
import ViewsRoutingKeys from './ViewsRoutingKeys';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private _accountBannedEventKey: string;
  private _accountDeletedEventKey: string;
  private _accountRolesUpdatedEventKey: string;

  constructor(
    private readonly _router: Router,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _authService: AuthService) {
  }

  private _isLogged: boolean;
  public get IsLogged() { return this._authService.IsLogged; }

  ngOnInit(): void {

    if (this._authService.IsLogged) {

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.BanUpdated),
        (userBannedUntil: Date) => {
          if (userBannedUntil) {
            console.log("banned");
            //alert("You have been banned until " + moment(userBannedUntil).format("DD/MM/YYYY HH:mm:ss"));
            this._authService.logout();
            this._router.navigate([ViewsRoutingKeys.Root]);
          }
        });

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.UserDeleted),
        () => {
          console.log("account deleted");
          //alert("Your account has been deleted!");
          this._authService.logout();
          this._router.navigate([ViewsRoutingKeys.Root]);
        });

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.RolesUpdated),
        (newRole: identity.UserRoles) => {
          console.log("roles updated");
          location.reload();
        });
    }
  }

  ngOnDestroy(): void {
    this.removeSubscriptions();
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

}