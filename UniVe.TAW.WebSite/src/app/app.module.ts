// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// components
import { AppComponent } from './app.component';
import { SignupComponent } from './views/identity/signup/signup.component';
import { LoginComponent } from './views/identity/login/login.component';
import { HeaderComponent } from './ui/header/header.component';
import { JoinableMatchesComponent } from './views/game/joinable-matches/joinable-matches.component';
import { FleetConfiguratorComponent } from './views/game/match/fleet-configurator/fleet-configurator.component';
import { SnapAndDropComponent } from './views/game/interact/snap-and-drop/snap-and-drop.component';
import { OwnFieldComponent } from './views/game/match/own-field/own-field.component';
import { EnemyFieldComponent } from './views/game/match/enemy-field/enemy-field.component';

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
    SnapAndDropComponent,
    OwnFieldComponent,
    EnemyFieldComponent,
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
