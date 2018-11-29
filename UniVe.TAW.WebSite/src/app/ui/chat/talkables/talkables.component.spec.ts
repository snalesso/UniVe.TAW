import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkablesComponent } from './talkables.component';

describe('TalkablesComponent', () => {
  let component: TalkablesComponent;
  let fixture: ComponentFixture<TalkablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TalkablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TalkablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
