import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as jwt_decode from 'jwt-decode';
import * as httpStatusCodes from 'http-status-codes';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {
  }

  private _loginRequest: DTOs.ILoginCredentials = { Username: "Daedalus", Password: "aaa" };
  public get LoginRequest() { return this._loginRequest; }

  private _responseError: string;
  public get ResponseError() { return this._responseError; };

  public get canSendLoginRequest(): boolean {
    return this.LoginRequest != null
      && this.LoginRequest.Username != null
      && this.LoginRequest.Password != null;
  }

  public sendLoginRequest() {
    // TODO: handle no response when server is down
    this._authService.login(this.LoginRequest)
      .subscribe(
        response => {
          if (response.HasError) {
            this._responseError = response.ErrorMessage;
          }
          else if (response.Content) {
            this._router.navigate([ViewsRoutingKeys.MatchFinder]);
          }
        },
        (error: HttpErrorResponse) => {

          //this._responseError = ;
          console.log(error);

          switch (error.status) {
            case httpStatusCodes.UNAUTHORIZED:
              this._responseError = "Invalid credentials";
              break;

            default:
              this._responseError = error.message;
          }

        });
  }

  ngOnInit() {
    // if already logged in re-route to avaiable matches
    if (this._authService.Token) {
      this._router.navigate([ViewsRoutingKeys.MatchFinder]);
    }
  }

}
