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
import { OwnFieldComponent } from './ui/game/match/own-field/own-field.component';
import { EnemyFieldComponent } from './ui/game/match/enemy-field/enemy-field.component';
import { MatchChatComponent } from './ui/game/match/match-chat/match-chat.component';
import { MatchComponent } from './ui/game/match/match/match.component';

// services
//import { AuthService } from './auth.service';
//import { BattleFieldComponent } from './battle-field/battle-field.component';
//import { EnemyFieldComponent } from './enemy-field/enemy-field.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    HeaderComponent,
    JoinableMatchesComponent,
    FleetConfiguratorComponent,
    OwnFieldComponent,
    EnemyFieldComponent,
    MatchChatComponent,
    MatchComponent,
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
