import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatListEntryComponent } from './chat-list-entry.component';

describe('ChatListEntryComponent', () => {
  let component: ChatListEntryComponent;
  let fixture: ComponentFixture<ChatListEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatListEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
