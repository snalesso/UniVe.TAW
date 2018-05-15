import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyFieldComponent } from './enemy-field.component';

describe('EnemyFieldComponent', () => {
  let component: EnemyFieldComponent;
  let fixture: ComponentFixture<EnemyFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnemyFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
