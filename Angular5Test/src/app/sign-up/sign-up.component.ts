import { Component, OnInit } from '@angular/core';
// import * as auth from '../../assets/scripts/unive.taw.framework/auth';
// import * as net from '../../assets/scripts/unive.taw.framework/net';
// import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(
    //private readonly AuthService: AuthService
  ) {
    //this.SignupRequest.Username = "Dio bestia dai vai";
  }

  //public SignupRequest: auth.SignupRequestDto = new auth.SignupRequestDto();

  public Loading: boolean = false;

  public register() {

    // this.Loading = true;
    // this.AuthService.Signup(this.SignupRequest)
    //   .subscribe(
    //     data => {
    //       // this.alertService.success('Registration successful', true);
    //       // this.router.navigate(['/login']);
    //     },
    //     error => {
    //       // this.alertService.error(error);
    //       // this.loading = false;
    //     });
  }

  ngOnInit() {
  }

}
