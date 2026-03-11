import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { finalize, tap, Observable } from 'rxjs';
import { selectDisplayCurrency, selectUsdToArsRate } from '../../modules/authentication/state/authentication.selectors';
import { CurrencyApi } from './currency.api';
import { CurrencyManagerUtils } from './currency-manager.utils';
import { STORAGE_KEYS } from './models/constants/currency-manager.constants';
import { CurrencyRefreshSlot, CurrencyRefreshState } from './models/types/currency-manager.types';

export type CurrencyType = 'USD' | 'ARS';

@Injectable({
    providedIn: 'root',
})
export class CurrencyManager {
    private http = inject(HttpClient);
    private store = inject(Store);
    private currencyApi = inject(CurrencyApi);

    // #region STATE (from old CurrencyState)

    /** The currently selected currency (user can toggle) */
    readonly currentCurrency = signal<CurrencyType>('USD');

    /** Exchange rate from the NgRx store (set by profile response) */
    private storeRate = toSignal(this.store.select(selectUsdToArsRate), { initialValue: null });

    /** Manual rate override from refresh logic */
    private manualRate = signal<number | null>(null);

    /** Computed exchange rate with fallback */
    readonly exchangeRate = computed(() => this.manualRate() ?? this.storeRate() ?? 1450);

    readonly isLoadingRate = signal<boolean>(false);

    /** Display currency preference from user profile */
    private storeDisplayCurrency = toSignal(
        this.store.select(selectDisplayCurrency),
        { initialValue: null },
    );

    // #endregion

    constructor() {
        // Sync display currency preference from store
        effect(() => {
            const preferred = this.storeDisplayCurrency();
            if (preferred) {
                this.currentCurrency.set(preferred as CurrencyType);
            }
        });

        // Initial refresh check
        this.tryRefreshIfNeeded();
    }

    // #region STATE METHODS

    toggleCurrency(): void {
        this.currentCurrency.update(curr => curr === 'USD' ? 'ARS' : 'USD');
    }

    setCurrency(currency: CurrencyType): void {
        this.currentCurrency.set(currency);
    }

    updateRate(rate: number): void {
        this.manualRate.set(rate);
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

    // #endregion

    // #region REFRESH LOGIC

    /**
     * Evaluates if a refresh is needed based on the current Argentina time slot
     * and previous successful refreshes stored in localStorage.
     */
    public tryRefreshIfNeeded(): void {
        const storedState = this.getStoredRefreshState();

        if (CurrencyManagerUtils.shouldRefresh(storedState)) {
            this.refresh();
        }
    }

    /**
     * Perform the actual backend call to refresh the currency.
     */
    private refresh(): void {
        if (this.isLoadingRate()) {
            return;
        }

        this.isLoadingRate.set(true);

        this.currencyApi.getLatestRate().pipe(
            tap(response => {
                // Update the application broad state
                this.updateRate(response.rate);

                // Persist the fact that we refreshed this specific slot today
                this.saveRefreshSuccess();
            }),
            finalize(() => {
                this.isLoadingRate.set(false);
            })
        ).subscribe();
    }

    /**
     * Get the last refresh information from localStorage.
     */
    private getStoredRefreshState(): CurrencyRefreshState | null {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENCY_REFRESH_STATE);
        if (!data) return null;

        try {
            return JSON.parse(data) as CurrencyRefreshState;
        } catch {
            return null;
        }
    }

    /**
     * Save the current refresh success state to localStorage.
     */
    private saveRefreshSuccess(): void {
        const state: CurrencyRefreshState = {
            lastRefreshDate: CurrencyManagerUtils.nowInArgentina().toISODate()!,
            lastRefreshSlot: CurrencyManagerUtils.getCurrentSlot()
        };
        localStorage.setItem(STORAGE_KEYS.CURRENCY_REFRESH_STATE, JSON.stringify(state));
    }

    // #endregion
}
