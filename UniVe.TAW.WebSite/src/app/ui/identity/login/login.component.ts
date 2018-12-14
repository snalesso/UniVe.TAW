import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as jwt_decode from 'jwt-decode';
import * as httpStatusCodes from 'http-status-codes';

import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
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

  private _loginRequest = { /*Username: "Daedalus", Password: "aaa"*/ } as DTOs.ILoginCredentials;
  public get LoginRequest() { return this._loginRequest; }

  private _responseError: string;
  public get ResponseError() { return this._responseError; };

  public get canSendLoginRequest(): boolean {
    return this.LoginRequest != null
      && this.LoginRequest.Username != null
      && this.LoginRequest.Password != null;
  }

  public sendLoginRequest() {
    this._authService.login(this.LoginRequest)
      .subscribe(
        response => {
          if (response.ErrorMessage) {
            this._responseError = response.ErrorMessage;
          }
          else if (response.Content) {
            this._router.navigate([ViewsRoutingKeys.Root]);
          }
        },
        (response: HttpErrorResponse) => {
          this._responseError = response.error.ErrorMessage ? response.error.ErrorMessage : response.statusText;
        });
  }

  ngOnInit() {
  }

}
