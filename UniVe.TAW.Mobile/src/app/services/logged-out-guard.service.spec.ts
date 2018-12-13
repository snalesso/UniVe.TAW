import { TestBed } from '@angular/core/testing';

import { LoggedOutGuardService } from './logged-out-guard.service';

describe('LoggedOutGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoggedOutGuardService = TestBed.get(LoggedOutGuardService);
    expect(service).toBeTruthy();
  });
});
