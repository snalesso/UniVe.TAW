import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyTurnControllerComponent } from './enemy-turn-controller.component';

describe('EnemyTurnControllerComponent', () => {
  let component: EnemyTurnControllerComponent;
  let fixture: ComponentFixture<EnemyTurnControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnemyTurnControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemyTurnControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
