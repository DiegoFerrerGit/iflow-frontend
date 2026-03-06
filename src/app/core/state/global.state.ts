import { ActionReducerMap } from '@ngrx/store';
import { AuthenticationState } from '../../modules/authentication/state/authentication.state';
import { authenticationReducer } from '../../modules/authentication/state/authentication.reducer';
import { UserState } from '../../modules/user/state/user.state';
import { userReducer } from '../../modules/user/state/user.reducer';
import { CurrencyManagerState } from '../currency-manager/state/currency-manager.state';
import { currencyManagerReducer } from '../currency-manager/state/currency-manager.reducer';

export interface GlobalState {
    authentication: AuthenticationState;
    user: UserState;
    currencyManager: CurrencyManagerState;
}

export const appReducers: ActionReducerMap<GlobalState> = {
    authentication: authenticationReducer,
    user: userReducer,
    currencyManager: currencyManagerReducer,
};
