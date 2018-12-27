import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MatchPage } from './match.page';
import { FleetConfiguratorComponent } from './fleet-configurator/fleet-configurator.component';
import { OwnFieldControllerComponent } from './own-field-controller/own-field-controller.component';
import { EnemyFieldControllerComponent } from './enemy-field-controller/enemy-field-controller.component';
import { MatchChatComponent } from './match-chat/match-chat.component';

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
    OwnFieldControllerComponent,
    EnemyFieldControllerComponent,
    MatchChatComponent,
  ]
})
export class MatchPageModule { }
