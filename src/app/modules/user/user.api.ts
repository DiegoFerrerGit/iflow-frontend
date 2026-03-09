import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResponse } from '../authentication/models/interfaces/auth.interfaces';


@Injectable({ providedIn: 'root' })
export class UserApi {
    private readonly profileUrl = `${environment.apiUrl}/profile`;

    constructor(private http: HttpClient) { }

    public loadProfile(options?: { context?: HttpContext }): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(this.profileUrl, options);
    }
}
