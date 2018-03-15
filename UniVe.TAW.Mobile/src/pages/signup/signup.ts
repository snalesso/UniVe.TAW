import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
//import { HttpClient } from '@angular/common/http';
// import '../../assets/scripts/UniVe.TAW.Framework/Auth';
// import '../../assets/scripts/UniVe.TAW.Framework/Game';
// import '../../assets/scripts/UniVe.TAW.Framework/Chat';
// import '../../assets/scripts/UniVe.TAW.Framework/Utils';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  constructor(public navCtrl: NavController, public navParams: NavParams/*, public http: HttpClient*/) {
  }

  public username: string;
  public email: string;
  public password: string;
  public repeatedPassword: string;
  public canSendSignupRequest: boolean = true;

  public sendSignupRequest() {
    var sr = {
      username: this.username,
      email: this.email,
      password: this.password,
      unixBirthDate: Date.now(),
      nationality: "Italy"
    };
    // var obs = this.http.post("http://localhost:1632/Signup", JSON.stringify(sr));
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:1632/Signup', true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function (ev) {//Call a function when the state changes.
      if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        console.log(JSON.stringify(ev));
      }
    }
    xhr.send(JSON.stringify(sr));
    // xhr.send('string');
    // xhr.send(new Blob());
    // xhr.send(new Int8Array());
    // xhr.send({ form: 'data' });
    // xhr.send(document);

  }

}
