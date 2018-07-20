import { Component, OnInit } from '@angular/core';

import { MatchService } from '../match.service';

@Component({
  selector: 'app-enemy-field',
  templateUrl: './enemy-field.component.html',
  styleUrls: ['./enemy-field.component.css']
})
export class EnemyFieldComponent implements OnInit {

  constructor(private readonly matchService: MatchService) { }

  private _canShoot: boolean = false;
  public get canShoot(): boolean {
    return this._canShoot;
  }

  ngOnInit() {
  }

}
