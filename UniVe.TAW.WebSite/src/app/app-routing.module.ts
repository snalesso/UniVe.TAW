import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { JoinableMatchesComponent } from './ui/game/match-finder/match-finder.component';
import { FleetConfiguratorComponent } from './ui/game/match/fleet-configurator/fleet-configurator.component';
import { EnemyFieldComponent } from './ui/game/match/enemy-field/enemy-field.component';
import ViewsRoutingKeys from './ui/ViewsRoutingKeys';
import RoutingHelper from './RoutingHelper';
import RoutingParamKeys from '../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import { MatchComponent } from './ui/game/match/match/match.component';

const routes: Routes = [
  { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Signup, component: SignupComponent },
  { path: ViewsRoutingKeys.Login, component: LoginComponent },
  { path: ViewsRoutingKeys.MatchFinder, component: JoinableMatchesComponent },
  //{ path: RoutingHelper.buildRoutePath([ViewsRoutingKeys.FleetConfigurator], [RoutingParamKeys.MatchId]), component: FleetConfiguratorComponent },
  { path: RoutingHelper.buildRoutePath([ViewsRoutingKeys.Match], [RoutingParamKeys.MatchId]), component: MatchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }