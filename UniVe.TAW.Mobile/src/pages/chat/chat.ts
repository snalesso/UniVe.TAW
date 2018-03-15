import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  public message: string = "dio ladraccio cane";
  public canSend: boolean = false;

  public messages: {
    sender: { id: number, username: string },
    content: string,
    dateTime: moment.Moment,
  }[] = [
      {
        sender: { id: 12, username: "Napalm51" },
        content: "Mi ricorda quando combattevo in Vietnam, e usavo sempre \"Potere d'arresto\"!",
        dateTime: moment()
      },
      {
        sender: { id: 543, username: "Logorr01c0" },
        content: "Questo è un messaggio più lungo del solito!!! Bla bla bla bla, cazzo vuoi che dica per allungare la frase? Vabbè dirò qualcosa ... QUALCOSA!!!",
        dateTime: moment()
      },
      {
        sender: { id: 29, username: "GastriteCronica" },
        content: "Andatevene tutti a fanculo",
        dateTime: moment()
      },
      {
        sender: { id: 16, username: "Jesoo" },
        content: "Portane una che ci penso io ...!",
        dateTime: moment()
      }
    ];


  sendMessage(messageContent: string): void {
    alert(messageContent);
  }

}
