export type CurrencyRefreshSlot = 'PRE_MARKET' | 'MARKET_HOURS' | 'POST_MARKET' | 'OUT_OF_HOURS';

export interface CurrencyRefreshState {
    lastRefreshDate: string; // ISO format (YYYY-MM-DD)
    lastRefreshSlot: CurrencyRefreshSlot;
    lastRefreshTimestamp: number; // Unix timestamp in ms
}

export interface CurrencyResponse {
    rate: number;
    updatedAt: string;
}
