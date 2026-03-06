import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectDisplayCurrency, selectUsdToArsRate } from '../../modules/authentication/state/authentication.selectors';

export type CurrencyType = 'USD' | 'ARS';

@Injectable({
  providedIn: 'root',
})
export class CurrencyState {
  private store = inject(Store);

  /** The currently selected currency (user can toggle) */
  readonly currentCurrency = signal<CurrencyType>('USD');

  /** Exchange rate from the NgRx store (set by profile response) */
  private storeRate = toSignal(this.store.select(selectUsdToArsRate), { initialValue: null });

  /** Computed exchange rate with fallback */
  readonly exchangeRate = computed(() => this.storeRate() ?? 1450);

  readonly isLoadingRate = signal<boolean>(false);

  /** Display currency preference from user profile */
  private storeDisplayCurrency = toSignal(
    this.store.select(selectDisplayCurrency),
    { initialValue: null },
  );

  constructor() {
    // Sync display currency preference from store
    effect(() => {
      const preferred = this.storeDisplayCurrency();
      if (preferred) {
        this.currentCurrency.set(preferred);
      }
    });
  }

  toggleCurrency(): void {
    this.currentCurrency.update(curr => curr === 'USD' ? 'ARS' : 'USD');
  }

  setCurrency(currency: CurrencyType): void {
    this.currentCurrency.set(currency);
  }

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
}
