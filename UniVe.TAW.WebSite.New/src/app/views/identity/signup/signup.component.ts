import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import * as $ from 'jquery';

import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../../../assets/imported/unive.taw.webservice/infrastructure/identity';
import { isNumber } from 'util';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public readonly Countries: { id: identity.Country, name: string }[];
  public readonly SignupRequest = {} as DTOs.ISignupRequestDto;
  public RepeatedPassword: string;

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
    alert("Ciao!");
  }

  ngOnInit() {
  }

}
