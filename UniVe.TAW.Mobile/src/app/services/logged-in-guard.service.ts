import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import ViewsRoutingKeys from '../ViewsRoutingKeys';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuardService implements CanActivate {

  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService) { }

  public canActivate(): boolean {
    if (!this._authService.IsLogged) {
      this._router.navigate([ViewsRoutingKeys.Login]);
      return false;
    }
    return true;
  }
}
