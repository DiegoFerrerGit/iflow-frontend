import { DateTime } from 'luxon';
import { ARGENTINA_TIMEZONE, REFRESH_SLOTS } from './models/constants/currency-manager.constants';
import { CurrencyRefreshSlot, CurrencyRefreshState } from './models/types/currency-manager.types';

export class CurrencyManagerUtils {

    /**
     * Get current date time in Argentina timezone.
     */
    static nowInArgentina(): DateTime {
        return DateTime.now().setZone(ARGENTINA_TIMEZONE);
    }

    /**
     * Determine the current refresh slot based on Argentina time.
     */
    static getCurrentSlot(): CurrencyRefreshSlot {
        const now = this.nowInArgentina();
        const hour = now.hour;

        if (hour >= REFRESH_SLOTS.PRE_MARKET.start && hour < REFRESH_SLOTS.PRE_MARKET.end) {
            return 'PRE_MARKET';
        }
        if (hour >= REFRESH_SLOTS.MARKET_HOURS.start && hour < REFRESH_SLOTS.MARKET_HOURS.end) {
            return 'MARKET_HOURS';
        }
        if (hour >= REFRESH_SLOTS.POST_MARKET.start && hour < REFRESH_SLOTS.POST_MARKET.end) {
            return 'POST_MARKET';
        }

        return 'OUT_OF_HOURS';
    }

    /**
     * Check if a refresh is needed based on stored state.
     * We refresh if:
     * - No stored state exists.
     * - Day has changed.
     * - Slot has changed (e.g., from Pre-market to Market).
     * - More than 30 minutes have passed since last refresh (if in a valid slot).
     */
    static shouldRefresh(storedState: CurrencyRefreshState | null): boolean {
        const currentSlot = this.getCurrentSlot();

        // Don't refresh if we are outside market windows
        if (currentSlot === 'OUT_OF_HOURS') {
            return false;
        }

        if (!storedState || !storedState.lastRefreshTimestamp) {
            return true;
        }

        const today = this.nowInArgentina().toISODate();

        // If it's a different day, we always refresh if we are in a valid slot
        if (storedState.lastRefreshDate !== today) {
            return true;
        }

        // Check if the slot changed (transition from pre-market to market, etc)
        if (storedState.lastRefreshSlot !== currentSlot) {
            return true;
        }

        // Finally, check time interval: 30 minutes = 1800000ms
        const thirtyMinutes = 30 * 60 * 1000;
        const timeSinceLastRefresh = Date.now() - storedState.lastRefreshTimestamp;

        return timeSinceLastRefresh >= thirtyMinutes;
    }
}
