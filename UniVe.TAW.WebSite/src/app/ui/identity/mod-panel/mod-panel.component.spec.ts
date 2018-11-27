import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModPanelComponent } from './mod-panel.component';

describe('ModPanelComponent', () => {
  let component: ModPanelComponent;
  let fixture: ComponentFixture<ModPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
