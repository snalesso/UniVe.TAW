import { Component, OnInit, OnDestroy, Input, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import * as game from '../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../services/ServiceConstants';
import RoutingParamKeys from '../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../assets/unive.taw.webservice/application/DTOs';
import * as utils from '../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import ServiceEventKeys from '../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription, Observable, Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { IdentityService } from '../../services/identity.service';
import { ChatService } from '../../services/chat.service';
import { Tabs, Content } from '@ionic/angular';
import * as ngxSocketIO from 'ngx-socket-io';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit {

  constructor(
    private readonly _authService: AuthService,
    private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket
  ) { }

  @ViewChild("_tabs")
  private _tabs: Tabs;

  @ViewChild("_selectedChatTabContent")
  private _selectedChatTabContent: Content;

  private _chats: ReadonlyArray<DTOs.IChatDto>;
  public get Chats() { return this._chats; }

  public SelectedChat: DTOs.IChatDto;

  public OpenChat(chat: DTOs.IChatDto) {
    this.SelectedChat = chat;
    this._tabs.select("selected-chat-tab");
    //this._selectedChatTabContent.scrollToBottom();
  }

  public handleWhenChatFormMessageIsSent(sentMessage: DTOs.IChatMessageDto) {
    this.SelectedChat.Messages.push(sentMessage);
  }

  ngOnInit() {

    //this._tabs.ionNavDidChange.subscribe(next => console.log(next));

    if (this._authService.IsLogged) {
      this._chatService.getChatHistory()
        .subscribe(
          response => {
            this._chats = response.Content;
            this._tabs.select("chats-list-tab");
          },
          (error: ngHttp.HttpErrorResponse) => { });

      this._socketIOService.on(
        ServiceEventKeys.chatEventForUser(ServiceEventKeys.YouGotANewMessage, this._authService.LoggedUser.Id),
        (newMessage: DTOs.IChatMessageDto) => {
          const chatsToUpdate = this.Chats.filter(chat => chat.Interlocutor.Id == newMessage.SenderId);
          for (let chat of chatsToUpdate)
            chat.Messages.push(newMessage);
        });
    }
  }

}
