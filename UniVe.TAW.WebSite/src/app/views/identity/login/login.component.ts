import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import ServiceConstants from '../../../services/ServiceConstants';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public readonly LoginRequest = { Username: "Daedalus", Password: "aaa" } as DTOs.ILoginCredentials;
  public ResponseError: string;

  public get canSendLoginRequest(): boolean {
    return this.LoginRequest.Username != null
      && this.LoginRequest.Password != null;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router) {
  }

  public sendLoginRequest() {
    // TODO: handle no response when server is down
    this.authService.login(this.LoginRequest)
      .subscribe(response => {
        if (response.HasError) {
          this.ResponseError = response.ErrorMessage;
        }
        else {
          localStorage.setItem(ServiceConstants.AccessCredentials_Username, this.LoginRequest.Username);
          localStorage.setItem(ServiceConstants.AccessCredentials_Password, this.LoginRequest.Password);
          localStorage.setItem(ServiceConstants.AccessTokenKey, response.Content);
          this.router.navigate([ViewsRoutingKeys.EnemyField]);
        }
      });
  }

  ngOnInit() {
    // TODO: if already logged in re-route to avaiable matches
  }

}
