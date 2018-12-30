import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';
//import { NavController } from 'ionic-angular';


import * as identityDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as identity from '../../../../assets/unive.taw.webservice/infrastructure/identity';
//import ViewsRoutingKeys from '../../../presentation/ViewsRoutingKeys';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = {
    //Username: "_sergioo",
    //Password: "aaa",
    // BirthDate: new Date('1993-03-16'),
    CountryId: identity.Country.Undefined
  } as identityDTOs.ISignupRequestDto;

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router,
    //public readonly navCtrl: NavController
  ) {

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
    // TODO: handle no response when server is down
    this._authService.signup(this.SignupRequest)
      .subscribe(response => {
        if (response.ErrorMessage) {
          this.ResponseError = response.ErrorMessage;
        } else {
          this._router.navigate([ViewsRoutingKeys.Login]);
        }
      });
  }

  ngOnInit(): void {
  }

}
