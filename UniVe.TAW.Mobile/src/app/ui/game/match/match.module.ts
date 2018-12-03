import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MatchPage } from './match.page';
import { FleetConfiguratorComponent } from './fleet-configurator/fleet-configurator.component';
import { OwnTurnControllerComponent } from './own-turn-controller/own-turn-controller.component';
import { EnemyTurnControllerComponent } from './enemy-turn-controller/enemy-turn-controller.component';

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
    RouterModule.forChild(routes)
  ],
  declarations: [MatchPage, FleetConfiguratorComponent, OwnTurnControllerComponent, EnemyTurnControllerComponent]
})
export class MatchPageModule {}
