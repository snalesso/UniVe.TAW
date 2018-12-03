import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';
//import { NavController } from 'ionic-angular';

import * as DTOs from '../../../../assets/scripts/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/scripts/unive.taw.webservice/infrastructure/identity';
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
  ngOnInit(): void {
    // if already logged in re-route to avaiable matches
    // if (this._authService.Token) {
    //   this._router.navigate([ViewsRoutingKeys.MatchFinder]);
    // }
  }

  // TODO: make default BirthDate from code to UI binding work. Idea: https://stackoverflow.com/a/49690089/1790497

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = { Username: "_sergio", Password: "aaa", BirthDate: new Date('1993-03-16'), CountryId: identity.Country.Italy } as DTOs.ISignupRequestDto;
  public RepeatedPassword: string;
  public ResponseError: string;

  public get canSendSignupRequest(): boolean {
    return this.SignupRequest.Username != null
      && this.SignupRequest.Password != null
      && this.RepeatedPassword == this.SignupRequest.Password;
  }

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router,
    //public readonly navCtrl: NavController
  ) {

    this.Countries = Object.keys(identity.Country)
      .filter(countryName => !isNaN(identity.Country[countryName]))
      .map(countryName => ({ id: identity.Country[countryName], name: countryName }));
  }

  public sendSignupRequest() {
    // TODO: handle no response when server is down
    this._authService.signup(this.SignupRequest)
      .subscribe(response => {
        if (response.HasError) {
          this.ResponseError = response.ErrorMessage;
        } else {
          alert(response.Content);
          //this._router.navigate([ViewsRoutingKeys.Login]);
        }
      });
  }

}
