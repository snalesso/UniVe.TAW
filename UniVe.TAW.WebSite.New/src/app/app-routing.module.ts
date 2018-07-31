import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './views/identity/signup/signup.component';
import { LoginComponent } from './views/identity/login/login.component';
import { JoinableMatchesComponent } from './views/game/joinable-matches/joinable-matches.component';
import ViewsRoutingKeys from './views/ViewsRoutingKeys';

const routes: Routes = [
  { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Signup, component: SignupComponent },
  { path: ViewsRoutingKeys.Login, component: LoginComponent },
  { path: ViewsRoutingKeys.JoinableMatches, component: JoinableMatchesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
