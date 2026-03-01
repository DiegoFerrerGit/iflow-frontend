import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ExchangeRateResponse {
    rate: number;
    lastUpdated: string;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyApi {
    // Mocking the "dolar blue" or official exchange rate API
    getExchangeRate(): Observable<ExchangeRateResponse> {
        // Return a dummy value of 1450 ARS = 1 USD, simulating a 500ms network delay
        return of({
            rate: 1450,
            lastUpdated: new Date().toISOString()
        }).pipe(delay(500));
    }
}
