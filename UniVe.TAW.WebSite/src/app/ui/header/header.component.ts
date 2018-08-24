import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import 'jquery';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { tap, catchError, map, distinctUntilChanged } from 'rxjs/operators';

import * as DTOs from '../../../assets/imported/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../services/ServiceConstants';
import ViewsRoutingKeys from '../../views/ViewsRoutingKeys';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router) {

    this._userData = this.authService.LoggedUser;
    this._subscriptions.push(this.authService.WhenLoggedUserChanged.subscribe(value => this._userData = value));
  }

  private _userData: DTOs.IUserJWTData;
  public get Username() { return this._userData != null ? this._userData.Username : null; }

  private _isLogged: boolean;
  public get IsLogged() { return this.authService.IsLogged; }

  public logout() {
    this._userData = null;
    this.authService.logout();
    this.router.navigate([ViewsRoutingKeys.Login]);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

}
