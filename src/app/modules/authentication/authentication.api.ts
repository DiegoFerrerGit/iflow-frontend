import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CREDENTIALS_AND_SKIP_INTERCEPTORS } from '../../core/models/constants/global.constants';
import { AuthApiResponse } from './models/interfaces/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthenticationApi {
    private readonly baseUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

    loginWithGoogle(idToken: string): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/google`,
            { id_token: idToken },
            CREDENTIALS_AND_SKIP_INTERCEPTORS,
        );
    }

    refreshSession(): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/refresh`,
            {},
            CREDENTIALS_AND_SKIP_INTERCEPTORS,
        );
    }

    logout(): Observable<AuthApiResponse> {
        return this.http.post<AuthApiResponse>(
            `${this.baseUrl}/logout`,
            {},
            CREDENTIALS_AND_SKIP_INTERCEPTORS,
        );
    }
}
