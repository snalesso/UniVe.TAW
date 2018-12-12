import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import ViewsRoutingKeys from './ViewsRoutingKeys';
import { LoginPage } from './ui/identity/login/login.page';
import { SignupPage } from './ui/identity/signup/signup.page';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import ServiceConstants from './services/ServiceConstants';
import { RoutingHelper, RouteStep, RouteParam } from './Routing';
import RoutingParamKeys from '../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

const routes: Routes = [
  { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Login, component: LoginPage, pathMatch: 'full' },
  { path: ViewsRoutingKeys.Signup, component: SignupPage, pathMatch: 'full' },
  { path: ViewsRoutingKeys.MatchFinder, loadChildren: './ui/game/match-finder/match-finder.module#MatchFinderPageModule', pathMatch: 'full' },
  { path: ViewsRoutingKeys.Chat, loadChildren: './ui/chat/chat.module#ChatPageModule', pathMatch: 'full' },
  { path: 'list', loadChildren: './ui/test/list/list.module#ListPageModule' },
  {
    path: RoutingHelper.buildRoute([
      new RouteStep(ViewsRoutingKeys.Match),
      new RouteParam(RoutingParamKeys.matchId)
    ]), loadChildren: './ui/game/match/match.module#MatchPageModule', pathMatch: 'full'
  },
  { path: ViewsRoutingKeys.Rankings, loadChildren: './ui/identity/rankings/rankings.module#RankingsPageModule', pathMatch: 'full' },
  {
    path: RoutingHelper.buildRoute([
      new RouteStep(ViewsRoutingKeys.Users),
      new RouteParam(RoutingParamKeys.userId)
    ]),
    loadChildren: './ui/identity/users/profile/profile.module#ProfilePageModule', pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    SocketIoModule.forRoot({ url: ServiceConstants.ServerAddress, options: {} })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
