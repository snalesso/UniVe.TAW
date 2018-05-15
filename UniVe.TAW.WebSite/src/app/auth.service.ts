import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
// //import jwtdecode = require('jwt-decode');
// import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import '../assets/scripts/unive.taw.framework/auth';

@Injectable()
export class AuthService {

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
}
