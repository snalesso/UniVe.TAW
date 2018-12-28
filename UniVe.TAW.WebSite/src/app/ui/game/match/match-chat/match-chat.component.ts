import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';

import * as identityDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/identity';
import * as gameDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/game';
import * as chatDTOs from '../../../../../assets/unive.taw.webservice/application/DTOs/chat';

import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import { AuthService } from '../../../../services/auth.service';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import { ChatService } from '../../../../services/chat.service';

@Component({
  selector: 'app-match-chat',
  templateUrl: './match-chat.component.html',
  styleUrls: ['./match-chat.component.css']
})
export class MatchChatComponent implements OnInit, OnDestroy {

  private _youGotANewMessageEventKey: string;

  constructor(
    // private readonly _gameService: GameService,
    // private readonly _router: Router,
    // private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket) { }

  @Input()
  public InterlocutorId: string;

  private _chatMessages: chatDTOs.IChatMessageDto[] = [];
  public get ChatMessages() { return this._chatMessages; }

  public handleWhenChatFormMessageIsSent(sentMessage: chatDTOs.IChatMessageDto) {
    this._chatMessages.push(sentMessage);
  }

  ngOnInit() {

    this._chatService.getChatHistoryWith(this.InterlocutorId)
      .subscribe(
        response => {

          this._chatMessages.push(...response.Content);

          if (!this._youGotANewMessageEventKey) {

            this._youGotANewMessageEventKey = ServiceEventKeys.chatEventForUser(ServiceEventKeys.YouGotANewMessage, this._authService.LoggedUser.Id);
            this._socketIOService.on(
              this._youGotANewMessageEventKey,
              (newMessage: chatDTOs.IChatMessageDto) => {
                this._chatMessages.push(newMessage);
              });
          }

        },
        (response: ngHttp.HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
        });
  }

  ngOnDestroy(): void {
    if (this._youGotANewMessageEventKey) {
      this._socketIOService.removeListener(this._youGotANewMessageEventKey);
      this._youGotANewMessageEventKey = null;
    }
  }

}
