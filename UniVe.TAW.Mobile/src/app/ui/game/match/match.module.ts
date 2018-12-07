import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MatchPage } from './match.page';
import { FleetConfiguratorComponent } from './fleet-configurator/fleet-configurator.component';
import { OwnTurnControllerComponent } from './own-turn-controller/own-turn-controller.component';
import { EnemyTurnControllerComponent } from './enemy-turn-controller/enemy-turn-controller.component';
import { MatchChatComponent } from './match-chat/match-chat.component';
import { ChatFormComponent } from '../../chat/chat-form/chat-form.component';
import { ChatMessagesComponent } from '../../chat/chat-messages/chat-messages.component';
//import { ChatComponentsModule } from '../../chat/chat.components.module';

const routes: Routes = [
  {
    path: '',
    component: MatchPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    //ChatComponentsModule
  ],
  declarations: [
    MatchPage,

    FleetConfiguratorComponent,
    OwnTurnControllerComponent,
    EnemyTurnControllerComponent,
    MatchChatComponent,
  ]
})
export class MatchPageModule { }
