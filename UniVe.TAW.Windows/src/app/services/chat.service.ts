import { Injectable } from '@angular/core';
import * as ng_http from '@angular/common/http';

import * as identityDTOs from '../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../assets/unive.taw.webservice/application/DTOs/chat';

import * as net from '../../assets/unive.taw.webservice/infrastructure/net';
import ServiceConstants from './ServiceConstants';
import * as ngxSocketIO from 'ngx-socket-io';

import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

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
    } as chatDTOs.INewMessage

    return this._http.post<net.HttpMessage<chatDTOs.IChatMessageDto>>(endPoint, data, options);
  }

  public getChatHistoryWith(interlocutorId: string) {

    const endPoint = ServiceConstants.ServerAddress + "/chat/" + interlocutorId;
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<chatDTOs.IChatMessageDto[]>>(endPoint, options);
  }

  public getChatHistory() {

    const endPoint = ServiceConstants.ServerAddress + "/chat";
    const options = {
      headers: new ng_http.HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + this._authService.Token)
    };

    return this._http.get<net.HttpMessage<chatDTOs.IChatDto[]>>(endPoint, options);
  }

}
