import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as $ from 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import { isNumber } from 'util';
import ViewsRoutingKeys from '../../ViewsRoutingKeys';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  // TODO: make default BirthDate from code to UI binding work. Idea: https://stackoverflow.com/a/49690089/1790497

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = { Username: "Daedalus", Password: "aaa", BirthDate: new Date('1993-03-16'), CountryId: identity.Country.Italy } as DTOs.ISignupRequestDto;
  public RepeatedPassword: string;
  public ResponseError: string;

  public get canSendSignupRequest(): boolean {
    return this.SignupRequest.Username != null
      && this.SignupRequest.Password != null
      && this.RepeatedPassword == this.SignupRequest.Password;
  }

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    this.Countries = Object.keys(identity.Country)
      .filter(countryName => !isNaN(identity.Country[countryName]))
      .map(countryName => ({ id: identity.Country[countryName], name: countryName }));
  }

  public sendSignupRequest() {
    // TODO: handle no response when server is down
    this.authService.signup(this.SignupRequest)
      .subscribe(response => {
        if (response.HasError) {
          this.ResponseError = response.ErrorMessage;
        } else {
          this.router.navigate([ViewsRoutingKeys.Login]);
        }
      });
  }

  ngOnInit() {
    // TODO: if already logged in re-route to avaiable matches
  }

}
