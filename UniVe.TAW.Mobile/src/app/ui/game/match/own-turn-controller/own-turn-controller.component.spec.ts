import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnTurnControllerComponent } from './own-turn-controller.component';

describe('OwnTurnControllerComponent', () => {
  let component: OwnTurnControllerComponent;
  let fixture: ComponentFixture<OwnTurnControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnTurnControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnTurnControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
