import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError } from 'rxjs';
import { NO_INTERCEPTORS } from '../../../core/interceptors/models/constants/interceptors.constants';
import { AuthenticationApi } from '../authentication.api';
import { AuthActions } from '../state/authentication.actions';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Skip interceptor if NO_INTERCEPTORS context flag is set
    if (req.context.get(NO_INTERCEPTORS)) {
        return next(req);
    }

    const authApi = inject(AuthenticationApi);
    const store = inject(Store);
    const router = inject(Router);

    // Add withCredentials to all requests
    const credReq = req.clone({ withCredentials: true });

    return next(credReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.warn('[AuthInterceptor] 401 Unauthorized detected. Attempting to refresh session...', req.url);
                // Attempt to refresh the session
                return authApi.refreshSession().pipe(
                    switchMap(() => {
                        console.log('[AuthInterceptor] Session refresh successful. Retrying original request.');
                        // Retry the original request once
                        return next(credReq);
                    }),
                    catchError((refreshErr) => {
                        console.error('[AuthInterceptor] Session refresh failed:', refreshErr);
                        // Refresh failed → clear state and redirect to login
                        store.dispatch(AuthActions.clearAuth());
                        router.navigate(['/login']);
                        return throwError(() => error);
                    }),
                );
            }
            return throwError(() => error);
        }),
    );
};
