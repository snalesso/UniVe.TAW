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
