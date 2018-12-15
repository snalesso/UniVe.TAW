import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import * as game from '../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../services/ServiceConstants';
import RoutingParamKeys from '../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../assets/unive.taw.webservice/application/DTOs';
import * as utils from '../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription, Observable, Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { IdentityService } from '../../services/identity.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  private _youGotANewMessageEventKey: string;

  constructor(
    private readonly _authService: AuthService,
    private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket
  ) { }

  private _chats: ReadonlyArray<DTOs.IChatDto>;
  public get Chats() { return this._chats; }

  public SelectedChat: DTOs.IChatDto;

  public OpenChat(chat: DTOs.IChatDto) {
    this.SelectedChat = chat;
  }

  public handleWhenChatFormMessageIsSent(sentMessage: DTOs.IChatMessageDto) {
    this.SelectedChat.Messages.push(sentMessage);
  }

  ngOnInit() {

    if (this._authService.IsLogged) {
      const x = this._chatService.getChatHistory()
        .subscribe(
          response => {
            this._chats = response.Content;
          },
          (error: ngHttp.HttpErrorResponse) => { });

      this._socketIOService.on(
        (this._youGotANewMessageEventKey = ServiceEventKeys.chatEventForUser(ServiceEventKeys.YouGotANewMessage, this._authService.LoggedUser.Id)),
        (newMessage: DTOs.IChatMessageDto) => {
          const chatsToUpdate = this.Chats.filter(chat => chat.Interlocutor.Id == newMessage.SenderId);
          for (let chat of chatsToUpdate)
            chat.Messages.push(newMessage);
        });
    }
  }

  ngOnDestroy(): void {
    if (this._youGotANewMessageEventKey) {
      this._socketIOService.removeListener(this._youGotANewMessageEventKey);
      this._youGotANewMessageEventKey = null;
    }
  }

}
