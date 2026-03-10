import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { CurrencyManager } from '../currency-manager.manager';

describe('CurrencyManager', () => {
  let service: CurrencyManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({})
      ],
      providers: [CurrencyManager]
    });
    service = TestBed.inject(CurrencyManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
