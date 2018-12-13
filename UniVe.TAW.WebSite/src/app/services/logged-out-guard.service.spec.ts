import { TestBed, inject } from '@angular/core/testing';

import { LoggedOutGuardService } from './logged-out-guard.service';

describe('LoggedOutGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedOutGuardService]
    });
  });

  it('should be created', inject([LoggedOutGuardService], (service: LoggedOutGuardService) => {
    expect(service).toBeTruthy();
  }));
});
