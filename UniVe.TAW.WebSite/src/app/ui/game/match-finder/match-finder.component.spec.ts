import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchFinderComponent } from './match-finder.component';

describe('JoinableMatchesComponent', () => {
  let component: MatchFinderComponent;
  let fixture: ComponentFixture<MatchFinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MatchFinderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
