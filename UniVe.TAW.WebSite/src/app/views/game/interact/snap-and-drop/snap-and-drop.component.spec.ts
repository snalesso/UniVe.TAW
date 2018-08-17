import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapAndDropComponent } from './snap-and-drop.component';

describe('SnapAndDropComponent', () => {
  let component: SnapAndDropComponent;
  let fixture: ComponentFixture<SnapAndDropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnapAndDropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
