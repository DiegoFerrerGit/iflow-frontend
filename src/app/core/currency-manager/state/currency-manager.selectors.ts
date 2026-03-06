import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurrencyManagerState } from './currency-manager.state';

export const selectCurrencyManager = createFeatureSelector<CurrencyManagerState>('currencyManager');

export const selectDisplayCurrency = createSelector(
    selectCurrencyManager,
    (currencyManager: CurrencyManagerState) => currencyManager.displayCurrency,
);

export const selectReferenceDate = createSelector(
    selectCurrencyManager,
    (currencyManager: CurrencyManagerState) => currencyManager.referenceDate,
);

export const selectUsdToArsRate = createSelector(
    selectCurrencyManager,
    (currencyManager: CurrencyManagerState) => currencyManager.usdToArsRate,
);
