import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import * as identityDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as identity from '../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as net from '../../../../assets/unive.taw.webservice/infrastructure/net';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = { CountryId: identity.Country.Undefined } as identityDTOs.ISignupRequestDto;

  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router) {

    this.Countries = Object.keys(identity.Country)
      .filter(countryName => !isNaN(identity.Country[countryName]))
      .map(countryName => ({ id: identity.Country[countryName], name: countryName }));
    //this.Countries.unshift({ id: undefined, name: "" })
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
      },
        (response: HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
        });
  }

  ngOnInit() {
  }

}
