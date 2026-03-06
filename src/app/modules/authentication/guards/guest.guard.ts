import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter, switchMap } from 'rxjs';
import { selectIsAuthenticated, selectIsAuthResolved } from '../state/authentication.selectors';

/**
 * Guard for the login page.
 * Allows if NOT authenticated, otherwise redirects to /odin.
 */
export const guestGuard: CanActivateFn = () => {
    const store = inject(Store);
    const router = inject(Router);

    // Check if auth state is resolved. If not, trigger bootstrap so we can definitively know
    // if the user has an active session before deciding whether to show the login page
    // or redirect them.
    const isResolved = store.selectSignal(selectIsAuthResolved)();
    if (!isResolved) {
        store.dispatch({ type: '[Authentication] Bootstrap Auth' });
    }

    return store.select(selectIsAuthResolved).pipe(
        filter((resolved) => resolved), // wait until auth state is resolved
        switchMap(() => store.select(selectIsAuthenticated)),
        map((isAuthenticated) => {
            if (isAuthenticated) {
                return router.createUrlTree(['/odin']);
            }
            return true;
        }),
        take(1)
    );
};
