import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingsPage } from './rankings.page';

describe('RankingsPage', () => {
  let component: RankingsPage;
  let fixture: ComponentFixture<RankingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
