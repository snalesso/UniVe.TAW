import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchChatComponent } from './match-chat.component';

describe('MatchChatComponent', () => {
  let component: MatchChatComponent;
  let fixture: ComponentFixture<MatchChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
