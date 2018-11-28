import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import * as identity from '../assets/imported/unive.taw.webservice/infrastructure/identity';
import { Router } from '@angular/router';

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
          if (userBannedUntil)
            this._authService.logout();
          this._router.navigate(["/"]);
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