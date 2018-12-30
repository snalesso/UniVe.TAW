import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnFieldControllerComponent } from './own-field-controller.component';

describe('EnemyTurnControllerComponent', () => {
  let component: OwnFieldControllerComponent;
  let fixture: ComponentFixture<OwnFieldControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OwnFieldControllerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnFieldControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
