import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import * as game from '../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../services/ServiceConstants';
import RoutingParamKeys from '../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

import * as identityDTOs from '../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as utils from '../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import Events from '../../../assets/unive.taw.webservice/application/Events';
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

  private _chats: ReadonlyArray<chatDTOs.IChatDto>;
  public get Chats() { return this._chats; }

  public SelectedChat: chatDTOs.IChatDto;

  public OpenChat(chat: chatDTOs.IChatDto) {
    this.SelectedChat = chat;
  }

  public handleWhenChatFormMessageIsSent(sentMessage: chatDTOs.IChatMessageDto) {
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
        (this._youGotANewMessageEventKey = Events.chatEventForUser(Events.YouGotANewMessage, this._authService.LoggedUser.Id)),
        (newMessage: chatDTOs.IChatMessageDto) => {
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
