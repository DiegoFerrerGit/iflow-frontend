import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResponse } from '../authentication/models/interfaces/auth.interfaces';
import { ErrorsManager } from '../../core/errors/error.manager';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class UserApi {
    private readonly profileUrl = `${environment.apiUrl}/profile`;

    constructor(
        private http: HttpClient,
        private errorsManager: ErrorsManager
    ) { }

    public loadProfile(options?: { context?: HttpContext }): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(this.profileUrl, options).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorsManager.handle(error);
                return throwError(() => error);
            })
        );
    }
}
