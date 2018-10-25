import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { JoinableMatchesComponent } from './ui/game/match-finder/match-finder.component';
import { FleetConfiguratorComponent } from './ui/game/match/fleet-configurator/fleet-configurator.component';
import { OwnTurnControllerComponent } from './ui/game/match/own-turn-controller/own-turn-controller.component';
import ViewsRoutingKeys from './ui/ViewsRoutingKeys';
import RoutingHelper from './RoutingHelper';
import RoutingParamKeys from '../assets/imported/unive.taw.webservice/application/routing/RoutingParamKeys';
import { MatchComponent } from './ui/game/match/match/match.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import ServiceConstants from './services/ServiceConstants';
import { RankingsComponent } from './ui/game/rankings/rankings.component';

const routes: Routes = [
  { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Signup, component: SignupComponent },
  { path: ViewsRoutingKeys.Login, component: LoginComponent },
  { path: ViewsRoutingKeys.MatchFinder, component: JoinableMatchesComponent },
  //{ path: RoutingHelper.buildRoutePath([ViewsRoutingKeys.FleetConfigurator], [RoutingParamKeys.MatchId]), component: FleetConfiguratorComponent },
  { path: RoutingHelper.buildRoutePath([ViewsRoutingKeys.Match], [RoutingParamKeys.matchId]), component: MatchComponent },
  { path: ViewsRoutingKeys.Rankings, component: RankingsComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot({ url: ServiceConstants.ServerAddress, options: {} })],
  exports: [RouterModule]
})
export class AppRoutingModule { }