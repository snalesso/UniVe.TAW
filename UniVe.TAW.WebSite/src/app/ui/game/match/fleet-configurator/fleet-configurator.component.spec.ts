import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetConfiguratorComponent } from './fleet-configurator.component';

describe('FleetConfiguratorComponent', () => {
  let component: FleetConfiguratorComponent;
  let fixture: ComponentFixture<FleetConfiguratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FleetConfiguratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
