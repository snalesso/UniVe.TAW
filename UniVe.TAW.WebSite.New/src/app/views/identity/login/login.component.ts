import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as $ from 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import { isNumber } from 'util';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import Constants from '../../../services/constants';

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

  constructor(private readonly authService: AuthService, private readonly router: Router) {
  }

  public sendLoginRequest() {
    this.authService.login(this.LoginRequest)
      .subscribe(response => {
        if (response.HasError) {
          this.ResponseError = response.ErrorMessage;
        }
        else {
          localStorage.setItem(Constants.AccessTokenKey, response.Content);
        }
      });
  }

  ngOnInit() {
    // TODO: if already logged in re-route to avaiable matches
  }

}
