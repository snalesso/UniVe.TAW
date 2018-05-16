import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

// observables
import { tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import jwtdecode = require('jwt-decode');

import '../assets/scripts/unive.taw.framework/auth';

@Injectable()
export class AuthService {

  private static readonly TokenCacheKey = 'postmessages_token';

  public token = '';
  public readonly url = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {
    console.log('AuthService instantiated');
  }

  public signup(sr: any/*unive.taw.framework.auth.SignupRequestDto*/): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      })
    };

    return this.http
      .post(this.url + '/users', sr, options);
  }

  public login(mail: string, password: string, remember: boolean): Observable<any> {

    console.log('Login: ' + mail + ' ' + password);
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa(mail + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
      })
    };

    return this.http.get(this.url + '/login', options, ).pipe(
      tap((data) => {
        console.log(JSON.stringify(data));
        this.token = data.token;
        if (remember) {
          localStorage.setItem(AuthService.TokenCacheKey, this.token);
        }
      }));
  }

  renew(): Observable<any> {

    const tk = localStorage.getItem(AuthService.TokenCacheKey);
    if (!tk || tk.length < 1) {
      return new ErrorObservable({ error: { errormessage: 'No token found in local storage' } });
    }

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + tk,
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      })
    };

    console.log('Renewing token');
    return this.http
      .get(this.url + '/renew', options, )
      .pipe(
        tap((data) => {
          console.log(JSON.stringify(data));
          this.token = data.token;
          localStorage.setItem(AuthService.TokenCacheKey, this.token);
        }));
  }

  logout() {
    console.log('Logging out');
    this.token = '';
    localStorage.setItem(AuthService.TokenCacheKey, this.token);
  }
}
