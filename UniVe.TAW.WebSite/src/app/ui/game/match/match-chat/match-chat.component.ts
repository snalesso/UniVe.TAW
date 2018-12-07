import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';
import * as DTOs from '../../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as net from '../../../../../assets/imported/unive.taw.webservice/infrastructure/net';
import * as game from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import { AuthService } from '../../../../services/auth.service';
import * as http from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import { ChatService } from 'src/app/services/chat.service';

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

  private _chatMessages: DTOs.IChatMessageDto[] = [];
  public get ChatMessages() { return this._chatMessages; }

  public handleWhenChatFormMessageIsSent(sentMessage: DTOs.IChatMessageDto) {
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
              (newMessage: DTOs.IChatMessageDto) => {
                this._chatMessages.push(newMessage);
              });
          }

        },
        (error: http.HttpErrorResponse) => { });
  }

  ngOnDestroy(): void {
    if (this._youGotANewMessageEventKey) {
      this._socketIOService.removeListener(this._youGotANewMessageEventKey);
      this._youGotANewMessageEventKey = null;
    }
  }

}
