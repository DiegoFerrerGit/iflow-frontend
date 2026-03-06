import { createReducer, on } from '@ngrx/store';
import { CurrencyManagerState, initialCurrencyManagerState } from './currency-manager.state';
import { AuthActions } from '../../../modules/authentication/state/authentication.actions';

export const currencyManagerReducer = createReducer(
    initialCurrencyManagerState,

    on(AuthActions.loadProfileSuccess, (state, { profile }): CurrencyManagerState => ({
        ...state,
        displayCurrency: profile.preferences.display_currency,
        referenceDate: profile.exchange_rate.reference_date,
        usdToArsRate: profile.exchange_rate.usd_to_ars_rate,
    })),

    on(AuthActions.clearAuth, (): CurrencyManagerState => ({
        ...initialCurrencyManagerState,
    })),
);
