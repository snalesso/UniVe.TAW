import { TestBed, inject } from '@angular/core/testing';

import { LoggedInGuard } from './logged-in.guard';

describe('LoggedInGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedInGuard]
    });
  });

  it('should be created', inject([LoggedInGuard], (service: LoggedInGuard) => {
    expect(service).toBeTruthy();
  }));
});
