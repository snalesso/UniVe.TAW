import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  private _chatHeaders: DTOs.IChatHistoryHeaderDto[] = [];

  constructor(
    //private readonly _router: Router,
    //private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    //private readonly _gameService: GameService,
    private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket,
    //private readonly _identityService: IdentityService
  ) { }

  public get ChatHeaders() { return this._chatHeaders; }

  public openChat(playerId: string) {
  }

  ngOnInit() {

    this._chatService.getChatsHistory()
      .subscribe(
        response => {

          this._chatHeaders = response.Content;

          // this._socketIOService.on(
          //   ServiceEventKeys.chatEventForUser(this._authService.LoggedUser.Id, ServiceEventKeys.YouGotANewMessage),
          //   (newMessage: DTOs.IChatHistoryHeaderDto) => {
          //     this._chatHeaders.unshift(newMessage);
          //   });
        },
        (error: ngHttp.HttpErrorResponse) => { });
  }

}
