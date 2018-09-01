import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnFieldComponent } from './own-field.component';

describe('OwnFieldComponent', () => {
  let component: OwnFieldComponent;
  let fixture: ComponentFixture<OwnFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
