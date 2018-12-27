import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyFieldControllerComponent } from './enemy-field-controller.component';

describe('EnemyFieldComponent', () => {
  let component: EnemyFieldControllerComponent;
  let fixture: ComponentFixture<EnemyFieldControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnemyFieldControllerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemyFieldControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
