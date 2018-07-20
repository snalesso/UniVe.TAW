import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import * as $ from 'jquery';

import * as DTOs from '../../assets/imported/unive.taw.webservice/application/DTOs';
import * as identity from '../../assets/imported/unive.taw.webservice/infrastructure/identity';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public readonly signupRequest = {} as DTOs.ISignupRequestDto;

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    let countries = Object
      .keys(identity.Country)
      .map(countryName => ({ id: identity.Country[countryName], name: countryName }));
  }

  public sendSignupRequest() {

    // let username = $('#signup-username').val() as string;
    // let password = $('#signup-password').val() as string;
    // let birthDateString = $('#signup-birthDate').val() as string;
    // let birthDate = new Date(birthDateString);
    // let countryId = $('#signup-country').val() as number;

    // this.signupRequest.Username = username;
    // this.signupRequest.Password = password;
    // this.signupRequest.BirthDate = birthDate;
    // this.signupRequest.CountryId = countryId;

    if (this.signupRequest.Password != $('#signup-passwordRepeated').val()) {
      throw new Error("passwords do not match!");
    }
    else {

      this.authService.signup(this.signupRequest).subscribe(
        (response) => {
          if (response.error) {
            $('#responseError').html(JSON.stringify(response.error));
          }
          this.router.navigate(['/login']);
        },
        (failure) => {
          // TODO: log
        }
      );
    }
  }

  ngOnInit() {
  }

}
