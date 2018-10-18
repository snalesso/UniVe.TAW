import { Injectable, OnDestroy } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import ServiceConstants from './ServiceConstants';

import 'jquery';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { tap, catchError, map, distinctUntilChanged } from 'rxjs/operators';
import { pipe } from '@angular/core/src/render3/pipe';

//import chalk from 'chalk';

@Injectable({
  providedIn: 'root'
})
// TODO: handle socket.io connection to send user, and disconnection to inform server and close user connection so in case of new login with another account, the newly logged user (that is different from the previous) does not keep using the other user's connection
export class AuthService implements OnDestroy {

  private readonly AccessTokenKey = "access_token";

  private readonly _subscriptions: Subscription[] = [];

  constructor(private readonly http: ng_http.HttpClient) {

    this._whenTokenChanged = new BehaviorSubject<string>(null);
    this._whenLoggedUserChanged = new BehaviorSubject<DTOs.IUserJWTData>(null);
    this._whenIsLoggedChanged = new BehaviorSubject<boolean>(false);

    this._subscriptions.push(this._whenTokenChanged.subscribe(value => {
      this._whenLoggedUserChanged.next(value != null ? jwt_decode<DTOs.IUserJWTData>(value) : null);
      this._whenIsLoggedChanged.next(this.IsLogged);
    }));

    this._whenTokenChanged.next(this.Token);
  }

  public get Token() { return localStorage.getItem(this.AccessTokenKey); }
  private readonly _whenTokenChanged: BehaviorSubject<string>;
  public get WhenTokenChanged() { return this._whenTokenChanged.asObservable(); }

  public get LoggedUser() { return this._whenLoggedUserChanged.getValue(); }
  private readonly _whenLoggedUserChanged: BehaviorSubject<DTOs.IUserJWTData>;
  public get WhenLoggedUserChanged() { return this._whenLoggedUserChanged.asObservable(); }

  public get IsLogged() { return this.Token != null; }
  private readonly _whenIsLoggedChanged: BehaviorSubject<boolean>;
  public get WhenIsLoggedChanged() { return this._whenIsLoggedChanged.asObservable(); }

  public signup(signupRequest: DTOs.ISignupRequestDto): Observable<net.HttpMessage<boolean>> {

    const endPoint = ServiceConstants.ServerAddress + "/users/signup";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<net.HttpMessage<boolean>>(
      endPoint,
      signupRequest,
      options)
  }

  public login(credentials: DTOs.ILoginCredentials)/*: Observable<net.HttpMessage<string>>*/ {

    const base64Credentials = btoa(credentials.Username + ":" + credentials.Password);

    const endPoint = ServiceConstants.ServerAddress + "/auth/login";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + base64Credentials
      })
    };

    return this.http
      .post<net.HttpMessage<string>>(endPoint, null, options)
      .pipe(
        tap((response) => {
          if (response.HasError) {
            console.log("Login failed - server says: " + JSON.stringify(response.ErrorMessage));
          }
          else {
            this.storeToken(response.Content);
          }
        }),
        map((response) => {
          return new net.HttpMessage(
            response.Content != null,
            response.ErrorMessage);
        }));
  }

  public logout() {
    this.clearToken();
  }

  private storeToken(token: string) {
    localStorage.setItem(this.AccessTokenKey, token);
    this._whenTokenChanged.next(token);
  }

  private clearToken() {
    localStorage.removeItem(this.AccessTokenKey);
    this._whenTokenChanged.next(null);
  }

  ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

}