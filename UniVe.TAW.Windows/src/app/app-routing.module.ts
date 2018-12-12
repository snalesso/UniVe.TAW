import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocketIoModule } from 'ngx-socket-io';

import ViewsRoutingKeys from './ViewsRoutingKeys';
import { RoutingHelper, RouteStep, RouteParam } from './Routing';
import ServiceConstants from './services/ServiceConstants';

import { HomeComponent } from './components/home/home.component';
import { MatchFinderComponent } from './ui/game/match-finder/match-finder.component';
import { LoginComponent } from './ui/identity/login/login.component';
import { SignupComponent } from './ui/identity/signup/signup.component';
import { MatchComponent } from './ui/game/match/match.component';
import { RankingsComponent } from './ui/identity/rankings/rankings.component';
import { ProfileComponent } from './ui/identity/users/profile/profile.component';
import { ChatComponent } from './ui/chat/chat.component';

import RoutingParamKeys from '../assets/unive.taw.webservice/application/routing/RoutingParamKeys';

const routes: Routes = [
    // {
    //     path: '',
    //     component: HomeComponent
    // },
    { path: '', redirectTo: ViewsRoutingKeys.Login, pathMatch: 'full' },
    { path: ViewsRoutingKeys.Signup, component: SignupComponent },
    { path: ViewsRoutingKeys.Login, component: LoginComponent },
    { path: ViewsRoutingKeys.MatchFinder, component: MatchFinderComponent },
    {
        path: RoutingHelper.buildRoute([
            new RouteStep(ViewsRoutingKeys.Match),
            new RouteParam(RoutingParamKeys.matchId)
        ]),
        component: MatchComponent
    },
    // {
    //   path: RoutingHelper.buildRoute([
    //     new RouteStep(ViewsRoutingKeys.Users),
    //     new RouteParam(RoutingParamKeys.userId),
    //     new RouteStep(ViewsRoutingKeys.MatchHistory)
    //   ]), component: MatchHistoryComponent, pathMatch: "full"
    // },
    { path: ViewsRoutingKeys.Rankings, component: RankingsComponent },
    {
        path: 'users/:userId',
        component: ProfileComponent
    },
    {
        path: RoutingHelper.buildRoute([
            new RouteStep(ViewsRoutingKeys.Chat)
        ]),
        component: ChatComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: false }),
        SocketIoModule.forRoot({ url: ServiceConstants.ServerAddress, options: {} })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
