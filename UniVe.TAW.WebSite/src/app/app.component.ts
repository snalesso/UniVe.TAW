import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import * as identity from '../assets/imported/unive.taw.webservice/infrastructure/identity';
import { Router } from '@angular/router';
import * as moment from 'moment';
import ViewsRoutingKeys from './ViewsRoutingKeys';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private readonly _router: Router,
    private readonly _socketIOService: ngxSocketIO.Socket,
    private readonly _authService: AuthService) {

    if (this._authService.IsLogged) {

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.BanUpdated),
        (userBannedUntil: Date) => {
          if (userBannedUntil) {
            this._authService.logout();
            alert("You have been banned until " + moment(userBannedUntil).format("DD/MM/YYYY HH:mm:ss"));
            this._router.navigate([ViewsRoutingKeys.Root]);
          }
        });

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.UserDeleted),
        () => {
          this._authService.logout();
          alert("Your account has been deleted!");
          this._router.navigate([ViewsRoutingKeys.Root]);
        });

      this._socketIOService.once(
        ServiceEventKeys.userEvent(this._authService.LoggedUser.Id, ServiceEventKeys.RolesUpdated),
        (newRole: identity.UserRoles) => {
          location.reload();
        });
    }
  }

  private _isLogged: boolean;
  public get IsLogged() { return this._authService.IsLogged; }

}