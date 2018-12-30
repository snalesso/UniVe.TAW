import { TestBed } from '@angular/core/testing';

import { LoggedOutGuard } from './logged-out.guard';

describe('LoggedOutGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoggedOutGuard = TestBed.get(LoggedOutGuard);
    expect(service).toBeTruthy();
  });
});
