export interface CurrencyManagerState {
    displayCurrency: 'USD' | 'ARS' | null;
    referenceDate: string | null;
    usdToArsRate: number | null;
}

export const initialCurrencyManagerState: CurrencyManagerState = {
    displayCurrency: null,
    referenceDate: null,
    usdToArsRate: null,
};
