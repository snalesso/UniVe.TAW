import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { HeaderComponent } from './ui/navigation/header/header.component';
import { MatchFinderComponent } from './ui/game/match-finder/match-finder.component';
import { FleetConfiguratorComponent } from './ui/game/match/fleet-configurator/fleet-configurator.component';
import { EnemyTurnControllerComponent } from './ui/game/match/enemy-turn-controller/enemy-turn-controller.component';
import { OwnTurnControllerComponent } from './ui/game/match/own-turn-controller/own-turn-controller.component';
import { MatchChatComponent } from './ui/game/match/match-chat/match-chat.component';
import { MatchComponent } from './ui/game/match/match.component';
import { ProfileComponent } from './ui/identity/users/profile/profile.component';
import { RankingsComponent } from './ui/identity/rankings/rankings.component';
import { MatchHistoryComponent } from './ui/identity/users/match-history/match-history.component';
import { ChatComponent } from './ui/chat/chat.component';
import { ChatFormComponent } from './ui/chat/chat-form/chat-form.component';
import { ChatMessagesComponent } from './ui/chat/chat-messages/chat-messages.component';
import { ChatListEntryComponent } from './ui/chat/chat-list-entry/chat-list-entry.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    SignupComponent,
    LoginComponent,
    HeaderComponent,
    MatchFinderComponent,
    FleetConfiguratorComponent,
    EnemyTurnControllerComponent,
    OwnTurnControllerComponent,
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
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
