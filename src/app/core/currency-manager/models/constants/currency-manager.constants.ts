export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

export const REFRESH_SLOTS = {
    PRE_MARKET: { start: 8, end: 10 },    // 08:00 - 09:59
    MARKET_HOURS: { start: 10, end: 16 }, // 10:00 - 15:59
    POST_MARKET: { start: 16, end: 18 }   // 16:00 - 18:00
};

export const STORAGE_KEYS = {
    CURRENCY_REFRESH_STATE: 'iflow_currency_refresh_state'
};
