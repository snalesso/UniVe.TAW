import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { tap, catchError, map, distinctUntilChanged } from 'rxjs/operators';

import * as DTOs from '../../../../assets/scripts/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  private readonly _subscriptions: Subscription[] = [];

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {

    this._userData = this._authService.LoggedUser;
    this._subscriptions.push(this._authService.WhenLoggedUserChanged.subscribe(value => this._userData = value));
  }

  private _userData: DTOs.IUserJWTData;
  public get Username() { return this._userData != null ? this._userData.Username : null; }

  public get IsLogged() { return this._authService.IsLogged; }

  public logout() {
    this._userData = null;
    this._authService.logout();
    this._router.navigate([ViewsRoutingKeys.Login]);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

}
