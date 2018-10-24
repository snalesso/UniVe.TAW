import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { GameService } from '../../../../services/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import RoutingParamKeys from '../../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as game_client from '../../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ViewsRoutingKeys from '../../../ViewsRoutingKeys';
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
export class MatchChatComponent implements OnInit {

  constructor(
    // private readonly _gameService: GameService,
    // private readonly _router: Router,
    // private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket) { }

  @Input()
  public InterlocutorId: string;

  public MessageText: string;

  private _isSendingMessage: boolean = false;
  public get IsSendingMessage(): boolean { return this._isSendingMessage; }

  public get CanSendMessage(): boolean { return (this.MessageText != null && this.MessageText.length > 0) && !this.IsSendingMessage; }

  private _chatMessages: DTOs.IChatHistoryMessageDto[] = [
    {
      Timestamp: new Date(),
      Text: "Ciao!!",
      IsMine: true
    },
    {
      Timestamp: new Date(),
      Text: "Come va?",
      IsMine: true
    },
    {
      Timestamp: new Date(),
      Text: "Tutto bene, tu?? :D",
      IsMine: false
    },
    {
      Timestamp: new Date(),
      Text: "ben dai, prova a battermi! :D",
      IsMine: true
    },
    {
      Timestamp: new Date(),
      Text: "vedrai come le prendi! hahahah",
      IsMine: false
    }
  ];
  public get ChatMessages() { return this._chatMessages; }

  public sendMessage(/*text: string*/) {

    if (this.MessageText == null || this.MessageText.length <= 0)
      return;

    this._isSendingMessage = true;

    this._chatService.sendMessage(this.InterlocutorId, this.MessageText)
      .subscribe(
        response => {
          this.MessageText = null;
          this._chatMessages.unshift(response.Content);
          this._isSendingMessage = false;
        },
        (error: http.HttpErrorResponse) => {
          this._isSendingMessage = false;
        });
  }

  ngOnInit() {

    this._chatService.getChatMessagesWith(this.InterlocutorId)
      .subscribe(
        response => {

          for (let message of response.Content) {
            this._chatMessages.unshift(message);
          }

          this._socketIOService.on(
            ServiceEventKeys.chatEventForUser(this._authService.LoggedUser.Id, ServiceEventKeys.YouGotANewMessage),
            (newMessage: DTOs.IChatHistoryMessageDto) => {
              this._chatMessages.unshift(newMessage);
            });
        },
        (error: http.HttpErrorResponse) => { });
  }

}
