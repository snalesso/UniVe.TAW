import { TestBed, inject } from '@angular/core/testing';

import { DummyGameService } from './dummy-game.service';

describe('DummyGameService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DummyGameService]
    });
  });

  it('should be created', inject([DummyGameService], (service: DummyGameService) => {
    expect(service).toBeTruthy();
  }));
});
