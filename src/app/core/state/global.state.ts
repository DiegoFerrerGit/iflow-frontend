import { ActionReducerMap, ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { AuthenticationState } from '../../modules/authentication/state/authentication.state';
import { authenticationReducer } from '../../modules/authentication/state/authentication.reducer';
import { UserState } from '../../modules/user/state/user.state';
import { userReducer } from '../../modules/user/state/user.reducer';
import { CurrencyManagerState } from '../currency-manager/state/currency-manager.state';
import { currencyManagerReducer } from '../currency-manager/state/currency-manager.reducer';
import { LoaderState, loaderReducer } from '../loader-manager/state/loader.reducer';

export interface GlobalState {
    authentication: AuthenticationState;
    user: UserState;
    currencyManager: CurrencyManagerState;
    loader: LoaderState;
}

export const appReducers: ActionReducerMap<GlobalState> = {
    authentication: authenticationReducer,
    user: userReducer,
    currencyManager: currencyManagerReducer,
    loader: loaderReducer,
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({
        keys: ['authentication', 'user', 'currencyManager'],
        rehydrate: true,
        removeOnUndefined: true,
    })(reducer);
}

export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];
