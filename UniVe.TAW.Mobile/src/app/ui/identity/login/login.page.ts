import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

import * as identityDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/chat';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {
  }

  private _loginRequest = {
    // Username: "Furfante",
    // Password: "aaa"
  } as identityDTOs.ILoginCredentials;
  public get LoginRequest() { return this._loginRequest; }

  private _responseError: string;
  public get ResponseError() { return this._responseError; };

  public get canSendLoginRequest(): boolean {
    return this.LoginRequest != null
      && this.LoginRequest.Username != null
      && this.LoginRequest.Password != null;
  }

  public sendLoginRequest() {

    if (!this.canSendLoginRequest)
      return;

    // TODO: handle no response when server is down
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
