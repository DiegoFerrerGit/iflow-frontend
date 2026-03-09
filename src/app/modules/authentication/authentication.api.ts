import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WITH_CREDENTIALS_AND_SKIP_INTERCEPTORS } from '../../core/interceptors/models/constants/interceptors.constants';
import { AuthApiResponse } from './models/interfaces/auth.interfaces';
import { ErrorsManager } from '../../core/errors/error.manager';
import { ERROR_CONTEXTS } from '../../core/errors/models/constants/error-contexts.constants';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthenticationApi {
    private readonly baseUrl = `${environment.apiUrl}/auth`;

    constructor(
        private http: HttpClient,
        private errorsManager: ErrorsManager
    ) { }

    loginWithGoogle(idToken: string): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/google`,
            { id_token: idToken },
            WITH_CREDENTIALS_AND_SKIP_INTERCEPTORS,
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error, ERROR_CONTEXTS.AUTH_LOGIN);
                return throwError(() => error);
            })
        );
    }

    refreshSession(): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/refresh`,
            {},
            WITH_CREDENTIALS_AND_SKIP_INTERCEPTORS,
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }

    logout(): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/logout`,
            {},
            WITH_CREDENTIALS_AND_SKIP_INTERCEPTORS,
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }
}
