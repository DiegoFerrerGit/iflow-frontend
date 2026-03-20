import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthActions } from './authentication.actions';
import { AuthenticationApi } from '../authentication.api';
import { UserApi } from '../../user/user.api';
import { CacheManager } from '../../../core/cache/cache.manager';
import { HIDE_SPINNER_OPTIONS } from '../../../core/interceptors/models/constants/interceptors.constants';

@Injectable()
export class AuthenticationEffects {
    private actions$ = inject(Actions);
    private authApi = inject(AuthenticationApi);
    private userApi = inject(UserApi);
    private router = inject(Router);
    private cacheManager = inject(CacheManager);

    /** Bootstrap: try to load profile from existing cookies */
    bootstrapAuth$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.bootstrapAuth),
            switchMap(() =>
                this.userApi.loadProfile(HIDE_SPINNER_OPTIONS).pipe(
                    map((profile) => AuthActions.loadProfileSuccess({ profile })),
                    catchError(() =>
                        // Profile failed (401) → try refresh (also silencing interceptor)
                        of(AuthActions.refreshSession()),
                    ),
                ),
            ),
        ),
    );

    /** Refresh: attempt to refresh cookies then load profile */
    refreshSession$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshSession),
            switchMap(() =>
                this.authApi.refreshSession().pipe(
                    map(() => AuthActions.refreshSuccess()),
                    catchError(() => of(AuthActions.refreshFailure())),
                ),
            ),
        ),
    );

    /** After refresh success → load profile */
    refreshSuccessLoadProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshSuccess),
            switchMap(() =>
                this.userApi.loadProfile(HIDE_SPINNER_OPTIONS).pipe(
                    map((profile) => AuthActions.loadProfileSuccess({ profile })),
                    catchError((err: HttpErrorResponse) =>
                        of(AuthActions.loadProfileFailure({
                            error: err.error?.detail || 'Error al cargar el perfil',
                        })),
                    ),
                ),
            ),
        ),
    );

    /** Login: call backend with idToken */
    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginStart),
            exhaustMap(({ idToken }) =>
                this.authApi.loginWithGoogle(idToken).pipe(
                    map(() => AuthActions.loginSuccess()),
                    catchError((err: HttpErrorResponse) => {
                        let errorMsg: string;
                        if (err.status === 401) {
                            errorMsg = 'No existe el usuario o credenciales incorrectas.';
                        } else {
                            errorMsg = err.error?.detail || err.message || 'Error desconocido';
                        }
                        return of(AuthActions.loginFailure({ error: errorMsg }));
                    }),
                ),
            ),
        ),
    );

    /** After login success → load profile */
    loginSuccessLoadProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            switchMap(() =>
                this.userApi.loadProfile(HIDE_SPINNER_OPTIONS).pipe(
                    map((profile) => AuthActions.loadProfileSuccess({ profile })),
                    catchError((err: HttpErrorResponse) =>
                        of(AuthActions.loadProfileFailure({
                            error: err.error?.detail || 'Error al cargar el perfil',
                        })),
                    ),
                ),
            ),
        ),
    );

    /** After profile loaded successfully → navigate to /odin */
    profileSuccessNavigate$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loadProfileSuccess),
                tap(() => {
                    if (this.router.url === '/login') {
                        this.router.navigate(['/odin']);
                    }
                }),
            ),
        { dispatch: false },
    );

    /** Logout: call backend, then clear state and redirect */
    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logoutStart),
            exhaustMap(() =>
                this.authApi.logout().pipe(
                    map(() => AuthActions.logoutSuccess()),
                    catchError(() => of(AuthActions.logoutSuccess())),
                ),
            ),
        ),
    );

    logoutRedirect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logoutSuccess),
                tap(() => {
                    this.cacheManager.clearAll();
                    this.router.navigate(['/login']);
                }),
            ),
        { dispatch: false },
    );
}
