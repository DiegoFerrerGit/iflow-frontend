import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ProfileResponse } from '../models/interfaces/auth.interfaces';

export const AuthActions = createActionGroup({
    source: 'Authentication',
    events: {
        // Bootstrap
        'Bootstrap Auth': emptyProps(),

        // Login
        'Login Start': props<{ idToken: string }>(),
        'Login Success': emptyProps(),
        'Login Failure': props<{ error: string }>(),

        // Profile
        'Load Profile': emptyProps(),
        'Load Profile Success': props<{ profile: ProfileResponse }>(),
        'Load Profile Failure': props<{ error: string }>(),

        // Refresh
        'Refresh Session': emptyProps(),
        'Refresh Success': emptyProps(),
        'Refresh Failure': emptyProps(),

        // Logout
        'Logout Start': emptyProps(),
        'Logout Success': emptyProps(),

        // Clear
        'Clear Auth': emptyProps(),
    },
});
