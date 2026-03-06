import { createReducer, on } from '@ngrx/store';
import { UserState, initialUserState } from './user.state';
import { AuthActions } from '../../authentication/state/authentication.actions';


export const userReducer = createReducer(
    initialUserState,

    on(AuthActions.loadProfileSuccess, (state, { profile }): UserState => ({
        ...state,
        id: profile.user.id,
        email: profile.user.email,
        fullName: profile.user.full_name,
        avatarUrl: profile.user.avatar_url,
    })),

    on(AuthActions.logoutSuccess, AuthActions.clearAuth, (): UserState => ({
        ...initialUserState,
    })),
);
