import { TestBed } from '@angular/core/testing';

import { LoggedInGuardService } from './logged-in-guard.service';

describe('LoggedInGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoggedInGuardService = TestBed.get(LoggedInGuardService);
    expect(service).toBeTruthy();
  });
});
