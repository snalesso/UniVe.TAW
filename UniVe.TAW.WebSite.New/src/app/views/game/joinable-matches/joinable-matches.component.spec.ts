import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinableMatchesComponent } from './joinable-matches.component';

describe('JoinableMatchesComponent', () => {
  let component: JoinableMatchesComponent;
  let fixture: ComponentFixture<JoinableMatchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JoinableMatchesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinableMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
