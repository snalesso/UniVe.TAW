import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { tap, catchError, map, distinctUntilChanged } from 'rxjs/operators';

import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription[] = [];

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {
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

    this._userData = this._authService.LoggedUser;
    this._subscriptions.push(this._authService.WhenLoggedUserChanged.subscribe(value => this._userData = value));
  }

  ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

}
