import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableMatchesComponent } from './available-matches.component';

describe('AvailableMatchesComponent', () => {
  let component: AvailableMatchesComponent;
  let fixture: ComponentFixture<AvailableMatchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableMatchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
