import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as DTOs from '../../../../assets/scripts/unive.taw.webservice/application/DTOs';

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

  private _loginRequest = { Username: "Furfante", Password: "aaa" } as DTOs.ILoginCredentials;
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
          if (response.HasError) {
            this._responseError = response.ErrorMessage;
          }
          else if (response.Content) {
            this._router.navigate([ViewsRoutingKeys.MatchFinder]);
          }
        },
        (response: HttpErrorResponse) => {
          this._responseError = response.error.ErrorMessage ? response.error.ErrorMessage : response.statusText;
        });
  }

  ngOnInit() {
    // if already logged in re-route to avaiable matches
    if (this._authService.Token) {
      setTimeout(() => {
        this._router.navigate([ViewsRoutingKeys.MatchFinder]);
      }, 150);
    }
  }

}
