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
import { AuthService } from '../../../services/auth.service';
import { IdentityService } from '../../../services/identity.service';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-chat-list-entry',
  templateUrl: './chat-list-entry.component.html',
  styleUrls: ['./chat-list-entry.component.css']
})
export class ChatListEntryComponent implements OnInit {

  constructor(
    private readonly _authService: AuthService,
    //private readonly _chatService: ChatService,
    private readonly _socketIOService: ngxSocketIO.Socket) { }

  @Input()
  public Chat: DTOs.IChatDto;

  @Input()
  public IsSelected: boolean;

  ngOnInit() {

  }

}
