import { TestBed } from '@angular/core/testing';

import { LoggedInGuard } from './logged-in.guard';

describe('LoggedInGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoggedInGuard = TestBed.get(LoggedInGuard);
    expect(service).toBeTruthy();
  });
});
