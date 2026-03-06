import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { selectIsAuthenticated, selectIsAuthResolved } from '../state/authentication.selectors';

/**
 * Guard for protected routes.
 * Waits for auth to be resolved, then allows if authenticated, otherwise redirects to /login.
 */
export const authGuard: CanActivateFn = () => {
    const store = inject(Store);
    const router = inject(Router);

    // If auth state is not yet resolved (e.g., initial page load), trigger bootstrap
    // to attempt restoring session from httpOnly cookies.
    const isResolved = store.selectSignal(selectIsAuthResolved)();
    if (!isResolved) {
        store.dispatch({ type: '[Authentication] Bootstrap Auth' });
    }

    return store.select(selectIsAuthResolved).pipe(
        filter((resolved) => resolved),
        take(1),
        map(() => {
            const isAuth = store.selectSignal(selectIsAuthenticated)();
            if (isAuth) {
                return true;
            }
            return router.createUrlTree(['/login']);
        }),
    );
};
