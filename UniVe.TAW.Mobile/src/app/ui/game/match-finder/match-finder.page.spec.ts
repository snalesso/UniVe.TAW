import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchFinderPage } from './match-finder.page';

describe('MatchFinderPage', () => {
  let component: MatchFinderPage;
  let fixture: ComponentFixture<MatchFinderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchFinderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchFinderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
