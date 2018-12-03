import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchPage } from './match.page';

describe('MatchPage', () => {
  let component: MatchPage;
  let fixture: ComponentFixture<MatchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
