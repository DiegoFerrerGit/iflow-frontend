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

    const isResolved = store.selectSignal(selectIsAuthResolved)();
    if (!isResolved) {
        // If we are navigating to login, and auth is not resolved, we just assume they are a guest
        // to prevent unnecessary 401 backend requests.
        store.dispatch({ type: '[Authentication] Set Resolved Unauthenticated' });
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
