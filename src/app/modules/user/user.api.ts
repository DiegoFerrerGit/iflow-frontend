import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResponse } from '../authentication/models/interfaces/auth.interfaces';
import { WITH_CREDENTIALS, CREDENTIALS_AND_SKIP_INTERCEPTORS } from '../../core/models/constants/global.constants';

@Injectable({ providedIn: 'root' })
export class UserApi {
    private readonly profileUrl = `${environment.apiUrl}/profile`;

    constructor(private http: HttpClient) { }

    loadProfile(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(
            this.profileUrl,
            WITH_CREDENTIALS,
        );
    }

    /**
     * Load profile without auth interceptor.
     * Used during bootstrap/login flows where the effect handles retry logic.
     */
    loadProfileDirect(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(
            this.profileUrl,
            CREDENTIALS_AND_SKIP_INTERCEPTORS,
        );
    }
}
