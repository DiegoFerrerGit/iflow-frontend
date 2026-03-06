import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthenticationState } from './authentication.state';

export const selectAuthenticationState = createFeatureSelector<AuthenticationState>('authentication');

export const selectIsAuthenticated = createSelector(
    selectAuthenticationState,
    (auth: AuthenticationState) => auth.isAuthenticated,
);

export const selectIsAuthResolved = createSelector(
    selectAuthenticationState,
    (auth: AuthenticationState) => auth.isAuthResolved,
);

export {
    selectUser,
    selectUserId,
    selectUserEmail,
    selectUserFullName,
    selectUserAvatarUrl,
} from '../../user/state/user.selectors';

export {
    selectCurrencyManager,
    selectDisplayCurrency,
    selectReferenceDate,
    selectUsdToArsRate,
} from '../../../core/currency-manager/state/currency-manager.selectors';
