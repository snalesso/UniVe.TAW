import { TestBed, inject } from '@angular/core/testing';

import { LoggedOutGuard } from './logged-out.guard';

describe('LoggedOutGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedOutGuard]
    });
  });

  it('should be created', inject([LoggedOutGuard], (service: LoggedOutGuard) => {
    expect(service).toBeTruthy();
  }));
});
