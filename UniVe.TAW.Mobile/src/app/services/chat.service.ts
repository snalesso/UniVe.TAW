import { Injectable } from '@angular/core';
import * as ng_http from '@angular/common/http';

import * as DTOs from '../../assets/scripts/unive.taw.webservice/application/DTOs';
import * as net from '../../assets/scripts/unive.taw.webservice/infrastructure/net';
//import * as chat from '../../assets/imported/unive.taw.webservice/infrastructure/chat';
// import * as game from '../../assets/imported/unive.taw.webservice/infrastructure/game';
// import * as game_client from '../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from './ServiceConstants';

import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
//import 'socket.io-client';
import * as ngxSocketIO from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private readonly _http: ng_http.HttpClient,
    private readonly _authService: AuthService,
    private readonly _socketIOService: ngxSocketIO.Socket) {
  }

  public sendMessage(addresseeId: string, text: string) {

    const endPoint = ServiceConstants.ServerAddress + "/chat/" + addresseeId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };
    const data = {
      Text: text,
      AddresseeId: addresseeId
    } as DTOs.INewMessage

    return this._http.post<net.HttpMessage<DTOs.IChatMessageDto>>(endPoint, data, options);
  }

  public getChatHistoryWith(interlocutorId: string) {

    const endPoint = ServiceConstants.ServerAddress + "/chat/" + interlocutorId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IChatMessageDto[]>>(endPoint, options);
  }

  public getChatHistory() {

    const endPoint = ServiceConstants.ServerAddress + "/chat";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<DTOs.IChatDto[]>>(endPoint, options);
  }

}
