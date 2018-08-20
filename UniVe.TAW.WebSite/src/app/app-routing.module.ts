import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './views/identity/signup/signup.component';
import { LoginComponent } from './views/identity/login/login.component';
import { JoinableMatchesComponent } from './views/game/joinable-matches/joinable-matches.component';
import { FleetConfiguratorComponent } from './views/game/match/fleet-configurator/fleet-configurator.component';
import { EnemyFieldComponent } from './views/game/match/enemy-field/enemy-field.component';
import ViewsRoutingKeys from './views/ViewsRoutingKeys';
import RoutingHelper from './RoutingHelper';
import RoutingParamKeys from '../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';

const routes: Routes = [
  { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Signup, component: SignupComponent },
  { path: ViewsRoutingKeys.Login, component: LoginComponent },
  { path: RoutingHelper.buildRoutePath([ViewsRoutingKeys.JoinableMatches]/*, [RoutingParamKeys.MatchId]*/), component: JoinableMatchesComponent },
  { path: ViewsRoutingKeys.FleetConfigurator, component: FleetConfiguratorComponent },
  { path: ViewsRoutingKeys.EnemyField, component: EnemyFieldComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }