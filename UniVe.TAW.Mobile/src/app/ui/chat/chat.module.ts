import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatListEntryComponent } from './chat-list-entry/chat-list-entry.component';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';
//import { ChatComponentsModule } from './chat.components.module';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
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
    ChatPage,

    ChatFormComponent,
    ChatMessagesComponent,
    ChatListEntryComponent,
  ],
  exports: [
    // ChatListEntryComponent,
    // ChatMessagesComponent,
    // ChatFormComponent
  ]
})
export class ChatPageModule { }
