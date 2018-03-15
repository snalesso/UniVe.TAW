import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { ChatPage } from '../chat/chat';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = SignupPage;
  tab3Root = ChatPage;

  constructor() {

  }
}
