import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as $ from 'jquery';

import * as DTOs from '../../../../assets/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = { /*Username: "Daedalus", Password: "aaa", BirthDate: new Date('1993-03-16'), CountryId: identity.Country.Italy*/ } as DTOs.ISignupRequestDto;

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {

    this.Countries = Object.keys(identity.Country)
      .filter(countryName => !isNaN(identity.Country[countryName]))
      .map(countryName => ({ id: identity.Country[countryName], name: countryName }));
  }

  public RepeatedPassword: string;
  public ResponseError: string;

  public get canSendSignupRequest(): boolean {
    return this.SignupRequest.Username != null
      && this.SignupRequest.Password != null
      && this.RepeatedPassword == this.SignupRequest.Password;
  }

  public sendSignupRequest() {

    this._authService.signup(this.SignupRequest)
      .subscribe(response => {
        if (response.ErrorMessage) {
          this.ResponseError = response.ErrorMessage;
        } else {
          this._router.navigate([ViewsRoutingKeys.Login]);
        }
      });
  }

  ngOnInit() {
  }

}
