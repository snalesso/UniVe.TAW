// angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// components
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';

// srrvices
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './auth.service';
import { BattleFieldComponent } from './battle-field/battle-field.component';
import { EnemyFieldComponent } from './enemy-field/enemy-field.component';


@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    BattleFieldComponent,
    EnemyFieldComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: AuthService, useClass: AuthService }],
  bootstrap: [AppComponent]
})
export class AppModule { }
