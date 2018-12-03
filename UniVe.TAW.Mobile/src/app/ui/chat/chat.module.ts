import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatListEntryComponent } from './chat-list-entry/chat-list-entry.component';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';

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
    RouterModule.forChild(routes)
  ],
  declarations: [ChatPage, ChatFormComponent, ChatListEntryComponent, ChatMessagesComponent]
})
export class ChatPageModule {}
