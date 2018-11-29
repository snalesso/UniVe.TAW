// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// components
import { AppComponent } from './app.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { HeaderComponent } from './ui/navigation/header/header.component';
import { JoinableMatchesComponent } from './ui/game/match-finder/match-finder.component';
import { FleetConfiguratorComponent } from './ui/game/match/fleet-configurator/fleet-configurator.component';
import { EnemyTurnControllerComponent } from './ui/game/match/enemy-turn-controller/enemy-turn-controller.component';
import { OwnTurnControllerComponent } from './ui/game/match/own-turn-controller/own-turn-controller.component';
import { MatchChatComponent } from './ui/game/match/match-chat/match-chat.component';
import { MatchComponent } from './ui/game/match/match/match.component';
import { ProfileComponent } from './ui/identity/users/profile/profile.component';
import { RankingsComponent } from './ui/identity/rankings/rankings.component';
import { ChatListComponent } from './ui/chat/chat-list/chat-list.component';
import { ModPanelComponent } from './ui/identity/mod-panel/mod-panel.component';
import { MatchHistoryComponent } from './ui/identity/users/match-history/match-history.component';
import { ChatComponent } from './ui/chat/chat/chat.component';
import { TalkablesComponent } from './ui/chat/talkables/talkables.component';
import { ChatFormComponent } from './ui/chat/chat-form/chat-form.component';
import { ChatMessagesComponent } from './ui/chat/chat-messages/chat-messages.component';
import { ChatListEntryComponent } from './ui/chat/chat-list-entry/chat-list-entry.component';

// services
//import { AuthService } from './auth.service';
//import { BattleFieldComponent } from './battle-field/battle-field.component';
//import { EnemyFieldComponent } from './own-turn-controller/own-turn-controller.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    HeaderComponent,
    JoinableMatchesComponent,
    FleetConfiguratorComponent,
    EnemyTurnControllerComponent,
    OwnTurnControllerComponent,
    MatchChatComponent,
    MatchComponent,
    ProfileComponent,
    RankingsComponent,
    ChatListComponent,
    ModPanelComponent,
    MatchHistoryComponent,
    ChatComponent,
    TalkablesComponent,
    ChatFormComponent,
    ChatMessagesComponent,
    ChatListEntryComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
