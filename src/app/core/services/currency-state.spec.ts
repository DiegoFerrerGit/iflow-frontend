import { TestBed } from '@angular/core/testing';

import { CurrencyState } from './currency-state';

describe('CurrencyState', () => {
  let service: CurrencyState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
