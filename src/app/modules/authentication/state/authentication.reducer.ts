import { createReducer, on } from '@ngrx/store';
import { AuthenticationState, initialAuthenticationState } from './authentication.state';
import { AuthActions } from './authentication.actions';

export const authenticationReducer = createReducer(
    initialAuthenticationState,

    on(AuthActions.loginStart, (state): AuthenticationState => ({
        ...state,
    })),

    on(AuthActions.loginSuccess, (state): AuthenticationState => ({
        ...state,
    })),

    on(AuthActions.loginFailure, (state, { error }): AuthenticationState => ({
        ...state,
        isAuthenticated: false,
        isAuthResolved: true,
    })),

    on(AuthActions.loadProfileSuccess, (state): AuthenticationState => ({
        ...state,
        isAuthenticated: true,
        isAuthResolved: true,
    })),

    on(AuthActions.loadProfileFailure, (state, { error }): AuthenticationState => ({
        ...state,
        isAuthenticated: false,
        isAuthResolved: true,
    })),

    on(AuthActions.refreshSuccess, (state): AuthenticationState => ({
        ...state,
        // profile will be loaded next
    })),

    on(AuthActions.refreshFailure, (state): AuthenticationState => ({
        ...state,
        isAuthenticated: false,
        isAuthResolved: true,
    })),

    on(AuthActions.logoutSuccess, AuthActions.clearAuth, (): AuthenticationState => ({
        ...initialAuthenticationState,
        isAuthResolved: true,
    })),
);
