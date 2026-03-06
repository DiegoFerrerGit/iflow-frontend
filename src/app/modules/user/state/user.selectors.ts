import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUser = createFeatureSelector<UserState>('user');

export const selectUserId = createSelector(
    selectUser,
    (user: UserState) => user.id,
);

export const selectUserEmail = createSelector(
    selectUser,
    (user: UserState) => user.email,
);

export const selectUserFullName = createSelector(
    selectUser,
    (user: UserState) => user.fullName,
);

export const selectUserAvatarUrl = createSelector(
    selectUser,
    (user: UserState) => {
        if (!user.avatarUrl) return null;
        // Request a higher resolution image from Google instead of the default 96px
        return user.avatarUrl.replace('=s96-c', '=s400-c');
    }
);