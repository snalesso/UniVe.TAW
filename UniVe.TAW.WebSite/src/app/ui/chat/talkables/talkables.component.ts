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
import { Subscription, BehaviorSubject, Observable, AsyncSubject, Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { IdentityService } from 'src/app/services/identity.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-talkables',
  templateUrl: './talkables.component.html',
  styleUrls: ['./talkables.component.css']
})
export class TalkablesComponent implements OnInit {

  constructor(
    private readonly _authService: AuthService,
    private readonly _chatService: ChatService,
  ) { }

  private _talkableUsers: ReadonlyArray<DTOs.ISimpleUserDto>;
  public get TalkableUsers() { return this._talkableUsers; }

  private _whenTalkableUserClicked: Subject<DTOs.ISimpleUserDto> = new Subject<DTOs.ISimpleUserDto>();
  @Output()
  public get WhenTalkableUserClicked(): Observable<DTOs.ISimpleUserDto> { return this._whenTalkableUserClicked; }

  public onTalkableUserClicked(talkableUser: DTOs.ISimpleUserDto) {
    if (talkableUser)
      this._whenTalkableUserClicked.next(talkableUser);
  }

  ngOnInit() {

    if (this._authService.IsLogged) {
      const x = this._chatService.getTalkableUsers()
        .subscribe(
          response => {
            this._talkableUsers = response.Content;
          },
          (error: ngHttp.HttpErrorResponse) => { });
    }
  }

}
