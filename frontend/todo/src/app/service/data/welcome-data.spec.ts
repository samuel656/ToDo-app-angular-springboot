import { TestBed } from '@angular/core/testing';

import { WelcomeData } from './welcome-data';

describe('WelcomeData', () => {
  let service: WelcomeData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WelcomeData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
