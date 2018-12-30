// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { OwnFieldControllerComponent } from './ui/game/match/own-field-controller/own-field-controller.component';
import { EnemyFieldControllerComponent } from './ui/game/match/enemy-field-controller/enemy-field-controller.component';
// components
import { AppComponent } from './app.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { HeaderComponent } from './ui/navigation/header/header.component';
import { MatchFinderComponent } from './ui/game/match-finder/match-finder.component';
import { FleetConfiguratorComponent } from './ui/game/match/fleet-configurator/fleet-configurator.component';
import { MatchChatComponent } from './ui/game/match/match-chat/match-chat.component';
import { MatchComponent } from './ui/game/match/match.component';
import { ProfileComponent } from './ui/identity/users/profile/profile.component';
import { RankingsComponent } from './ui/identity/rankings/rankings.component';
import { MatchHistoryComponent } from './ui/identity/users/match-history/match-history.component';
import { ChatComponent } from './ui/chat/chat.component';
import { ChatFormComponent } from './ui/chat/chat-form/chat-form.component';
import { ChatMessagesComponent } from './ui/chat/chat-messages/chat-messages.component';
import { ChatListEntryComponent } from './ui/chat/chat-list-entry/chat-list-entry.component';

// services
//import { AuthService } from './auth.service';
//import { BattleFieldComponent } from './battle-field/battle-field.component';
//import { EnemyFieldComponent } from './enemy-field-controller/enemy-field-controller.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    HeaderComponent,
    MatchFinderComponent,
    FleetConfiguratorComponent,
    OwnFieldControllerComponent,
    EnemyFieldControllerComponent,
    MatchChatComponent,
    MatchComponent,
    ProfileComponent,
    RankingsComponent,
    MatchHistoryComponent,
    ChatComponent,
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
