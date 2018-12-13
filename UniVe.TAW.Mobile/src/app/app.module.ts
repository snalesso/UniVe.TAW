import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SignupPage } from './ui/identity/signup/signup.page';
import { LoginPage } from './ui/identity/login/login.page';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SideMenuComponent } from './ui/navigation/side-menu/side-menu.component';
import { MatchHistoryComponent } from './ui/identity/users/profile/match-history/match-history.component';
import { ProfilePage } from './ui/identity/users/profile/profile.page';

@NgModule({
  declarations: [
    AppComponent,
    SignupPage,
    LoginPage,
    SideMenuComponent,
    MatchHistoryComponent,
    ProfilePage],
  entryComponents: [],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
