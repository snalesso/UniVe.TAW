import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchRootComponent } from './match-root.component';

describe('MatchRootComponent', () => {
  let component: MatchRootComponent;
  let fixture: ComponentFixture<MatchRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
