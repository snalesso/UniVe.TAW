import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../../services/game.service';
import { IdentityService } from '../../../../services/identity.service';
import { AuthService } from '../../../../services/auth.service';
import * as game from '../../../../../assets/unive.taw.webservice/infrastructure/game';
import * as game_client from '../../../../../assets/unive.taw.webservice/infrastructure/game.client';
import ServiceConstants from '../../../../services/ServiceConstants';
import RoutingParamKeys from '../../../../../assets/unive.taw.webservice/application/routing/RoutingParamKeys';
import * as DTOs from '../../../../../assets/unive.taw.webservice/application/DTOs';
import * as utils from '../../../../../assets/unive.taw.webservice/infrastructure/utils';
import * as ngHttp from '@angular/common/http';
import * as ngxSocketIO from 'ngx-socket-io';
import ServiceEventKeys from '../../../../../assets/unive.taw.webservice/application/services/ServiceEventKeys';
import BanOption from './BanOption';
import * as identity from '../../../../../assets/unive.taw.webservice/infrastructure/identity';
import * as net from '../../../../../assets/unive.taw.webservice/infrastructure/net';
import UserRole from './UserRole';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import ViewsRoutingKeys from '../../../../ViewsRoutingKeys';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private readonly _subscriptions: Subscription[] = [];

  private _userId: string;

  private _userPowers: DTOs.IUserPowers;
  private _userProfile: DTOs.IUserProfile;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _identityService: IdentityService
  ) {
  }

  public SelectedBanOption: BanOption;
  public SelectedUserRole: UserRole;

  private _banOptions: BanOption[] = [];
  public get BanOptions(): BanOption[] {
    return this.Powers
      ? this._banOptions
      : null;
  }

  private readonly _userRoles: UserRole[] = [{ Name: "Mod", Value: identity.UserRoles.Moderator }, { Name: "Player", Value: identity.UserRoles.Player }];
  public get UserRoles() { return this._userRoles; }

  public get Powers() { return this._userPowers; }

  public get IsItMe() {
    return this._authService.IsLogged
      && this._userId == this._authService.LoggedUser.Id;
  }

  public get CanBeModerated() {
    return !this.IsItMe
      && this._userPowers
      && (this._userPowers.Roles > this._userProfile.Roles)
      && (this._userPowers.CanAssignRoles
        || this._userPowers.CanTemporarilyBan
        || this._userPowers.CanPermaBan);
  }

  public get CanPromote() {
    return !this.IsItMe
      && this._userPowers
      && (this._userPowers.Roles >= identity.UserRoles.Admin)
      && (this.Profile.Roles < identity.UserRoles.Admin)
      && this._userPowers.CanAssignRoles;
  }

  public get CanAssignRoles() {
    return !this.IsItMe
      && this._userPowers
      && this._userPowers.CanAssignRoles
      && this._userPowers.Roles == identity.UserRoles.Admin
      && this._userProfile.Roles < identity.UserRoles.Admin;
  }

  public get CanBeDeleted() {
    return !this.IsItMe
      && this._userPowers
      && this._userPowers.CanDeleteUser;
  }

  public IsDeleteUserButtonEnabled: boolean;

  public get Profile() { return this._userProfile; }

  public get UserId() { return this._userProfile ? this._userProfile.Id : null; }

  // private _whenUserIdChanged: BehaviorSubject<string> = new BehaviorSubject(null);
  // @Output()
  // public get WhenUserIdChanged(): Observable<string> { return this._whenUserIdChanged; }

  public get WindPercent() {

    if (this.Profile && (this.Profile.WinsCount + this.Profile.LossesCount) > 0)
      return Math.round(this.Profile.WinsCount / (this.Profile.WinsCount + this.Profile.LossesCount) * 100);

    return 0;
  }

  public getCountryName(countryId: number) {
    return identity.Country[countryId];
  }

  public ban(hours: number) {
    this._identityService.ban(this._userId, hours)
      .subscribe(
        response => {
          this._userProfile.BannedUntil = response.Content;
        },
        (response: ngHttp.HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
        });
  }

  public unban() {
    this.ban(0);
  }

  public assignRole(userRole: identity.UserRoles) {

    this._identityService.assignRole(this._userId, userRole)
      .subscribe(
        response => {
          this._userProfile.Roles = response.Content;
        },
        (response: ngHttp.HttpErrorResponse) => {
          const httpMessage = response.error as net.HttpMessage<string>;
          console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
        });
  }

  public deleteUser() {

    this._identityService.deleteUser(this._userId)
      .subscribe(
        response => {
          if (response.Content)
            this._router.navigate([ViewsRoutingKeys.Root]);
        },
        (error: ngHttp.HttpErrorResponse) => { });
  }

  ngOnInit() {

    this._subscriptions.push(
      this._activatedRoute.paramMap.subscribe(params => {

        this._userId = this._activatedRoute.snapshot.paramMap.get(RoutingParamKeys.userId);

        this._identityService.getUserProfile(this._userId)
          .subscribe(
            response => {
              this._userProfile = response.Content;
              const cur = this.UserRoles.filter(ur => ur.Value == this._userProfile.Roles);
              this.SelectedUserRole = (cur && cur.length) > 0 ? cur[0] : null;
            },
            (response: ngHttp.HttpErrorResponse) => {
              const httpMessage = response.error as net.HttpMessage<string>;
              console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
            });

        if (this._authService.IsLogged && !this.IsItMe) {

          this._identityService.getUserPowers(this._authService.LoggedUser.Id)
            .subscribe(
              response => {
                this._userPowers = response.Content;

                this._banOptions = [];

                if (this._userPowers) {
                  if (this._userPowers.CanTemporarilyBan) {
                    this._banOptions.push({ Text: "1 hour", BanHours: 1 });
                    this._banOptions.push({ Text: "1 day", BanHours: 24 });
                    this._banOptions.push({ Text: "1 week", BanHours: 24 * 7 });
                    this._banOptions.push({ Text: "1 month", BanHours: 24 * 31 });
                  }
                  if (this._userPowers.CanPermaBan)
                    this._banOptions.push({ Text: "Forever", BanHours: -1 });
                }
              },
              (response: ngHttp.HttpErrorResponse) => {
                const httpMessage = response.error as net.HttpMessage<string>;
                console.log(httpMessage ? httpMessage.ErrorMessage : response.message);
              });
        }
      })
    );
  }

  ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

}
