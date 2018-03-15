import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ChatServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ChatServiceProvider {

  constructor(public http: HttpClient) {
    console.log('Hello ChatServiceProvider Provider');
  }

  sendMessage(messageContent: string): boolean {
    var msg = { content: messageContent};
    this.http.post("http://localhost:1632/SendMessage", JSON.stringify(msg));
    return
  }

}
