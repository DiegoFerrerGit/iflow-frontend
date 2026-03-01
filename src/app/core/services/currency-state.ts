import { Injectable, signal, computed } from '@angular/core';
import { CurrencyApi } from '../apis/currency.api';

export type CurrencyType = 'USD' | 'ARS';

@Injectable({
  providedIn: 'root',
})
export class CurrencyState {
  // Global signals
  readonly currentCurrency = signal<CurrencyType>('USD');
  readonly exchangeRate = signal<number>(1450); // Default fallback
  readonly isLoadingRate = signal<boolean>(false);

  constructor(private currencyApi: CurrencyApi) {
    this.fetchExchangeRate();
  }

  toggleCurrency(): void {
    this.currentCurrency.update(curr => curr === 'USD' ? 'ARS' : 'USD');
  }

  setCurrency(currency: CurrencyType): void {
    this.currentCurrency.set(currency);
  }

  // Convert a given amount from a source currency to the currently selected currency
  convert(amount: number, sourceCurrency: CurrencyType = 'USD'): number {
    const current = this.currentCurrency();
    const rate = this.exchangeRate();
    if (sourceCurrency === current) {
      return amount;
    }
    if (sourceCurrency === 'USD' && current === 'ARS') {
      return amount * rate;
    }
    if (sourceCurrency === 'ARS' && current === 'USD') {
      return amount / rate;
    }
    return amount;
  }

  private fetchExchangeRate(): void {
    this.isLoadingRate.set(true);
    this.currencyApi.getExchangeRate().subscribe({
      next: (response) => {
        this.exchangeRate.set(response.rate);
        this.isLoadingRate.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch exchange rate', err);
        this.isLoadingRate.set(false);
      }
    });
  }
}
