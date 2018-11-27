import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private readonly _authService: AuthService) {
  }

  private _isLogged: boolean;
  public get IsLogged() { return this._authService.IsLogged; }

}