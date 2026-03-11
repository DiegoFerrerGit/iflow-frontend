import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrencyResponse } from './models/types/currency-manager.types';

@Injectable({
    providedIn: 'root'
})
export class CurrencyApi {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/currency`;

    /**
     * Fetch the latest currency reference from the backend.
     */
    public getLatestRate(): Observable<CurrencyResponse> {
        return this.http.get<CurrencyResponse>(this.API_URL);
    }
}
