import { TestBed } from '@angular/core/testing';

import { HardCodedAuthentication } from './hard-coded-authentication';

describe('HardCodedAuthentication', () => {
  let service: HardCodedAuthentication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HardCodedAuthentication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
