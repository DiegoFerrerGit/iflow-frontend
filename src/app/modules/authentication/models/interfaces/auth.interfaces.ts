export interface AuthUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
}

export interface AuthPreferences {
    display_currency: 'USD' | 'ARS';
}

export interface AuthExchangeRate {
    reference_date: string;
    usd_to_ars_rate: number;
}

export interface ProfileResponse {
    user: AuthUser;
    preferences: AuthPreferences;
    exchange_rate: AuthExchangeRate;
}

export interface AuthApiResponse {
    ok: boolean;
}
