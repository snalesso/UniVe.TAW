import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../services/game.service';
import * as game from '../../../../assets/imported/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../assets/imported/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../assets/imported/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../assets/imported/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../assets/imported/unive.taw.webservice/application/services/ServiceEventKeys';
import { Subscription, Observable, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css']
})
export class ChatFormComponent implements OnInit {

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

  public get CanSendMessage(): boolean { return !this.IsSendingMessage && this.MessageText != null && this.MessageText.length > 0; }

  private _whenMessageIsSent: Subject<DTOs.IChatMessageDto> = new Subject();
  @Output()
  public get WhenMessageIsSent(): Observable<DTOs.IChatMessageDto> { return this._whenMessageIsSent; }

  public sendMessage(/*text: string*/) {

    if (!this.CanSendMessage)
      return;

    this._isSendingMessage = true;

    this._chatService.sendMessage(this.InterlocutorId, this.MessageText)
      .subscribe(
        response => {
          this.MessageText = null;
          this._whenMessageIsSent.next(response.Content)
          this._isSendingMessage = false;
        },
        (error: ngHttp.HttpErrorResponse) => {
          this._isSendingMessage = false;
        });
  }

  ngOnInit() {
  }

}
