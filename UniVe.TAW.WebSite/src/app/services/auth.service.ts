import { Injectable } from '@angular/core';
import { unescapeIdentifier } from '@angular/compiler';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';
import * as net from '../../assets/imported/unive.taw.webservice/infrastructure/net';
import Constants from './constants';

import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

//import chalk from 'chalk';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private readonly http: ng_http.HttpClient) { }

  public signup(signupRequest: DTOs.ISignupRequestDto): Observable<net.HttpMessage<boolean>> {
    //   $.post(
    //     Constants.ServerAddress + "/users/signup",
    //     signupRequest)
    //     .done((success) => {
    //       console.log("Signup request sent!");
    //     })
    //     .fail((error, b, c) => {
    //       console.log("Error sending signup");
    //     });
    const endPoint = Constants.ServerAddress + "/users/signup";
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

  public login(credentials: DTOs.ILoginCredentials): Observable<net.HttpMessage<string>> {

    const base64Credentials = btoa(credentials.Username + ":" + credentials.Password);

    // const sett: JQueryAjaxSettings = {
    //   method: "post",
    //   url: Constants.ServerAddress + "/auth/login",
    //   data: credentials,
    //   headers: {
    //     //"authorization": "Basic RGFlZGFsdXM6c3BhenpvbGlubzk5"
    //     //   'Access-Control-Allow-Origin': '*',
    //     //   'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    //   },
    //   beforeSend: function (xhr) {
    //     xhr.setRequestHeader("Authorization", "Basic " + base64Credentials);
    //   },
    // };

    // $.ajax(sett)
    //   .done((success: net.HttpMessage<string>) => {
    //     console.log("Login request sent!");
    //     //return success.Content;
    //   })
    //   .fail((error, b, c) => {
    //     console.log("Error sending login");
    //     //return null;
    //   });

    const endPoint = Constants.ServerAddress + "/auth/login";
    const options = {
      headers: new ng_http.HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + base64Credentials
      })
    };
    return this.http.post<net.HttpMessage<string>>(endPoint, null, options);
  }
}
