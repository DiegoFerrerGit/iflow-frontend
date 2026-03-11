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
     */
    static shouldRefresh(storedState: CurrencyRefreshState | null): boolean {
        const currentSlot = this.getCurrentSlot();

        // Don't refresh if we are outside market windows
        if (currentSlot === 'OUT_OF_HOURS') {
            return false;
        }

        if (!storedState) {
            return true;
        }

        const today = this.nowInArgentina().toISODate();

        // If it's a different day, we always refresh if we are in a valid slot
        if (storedState.lastRefreshDate !== today) {
            return true;
        }

        // If it's the same day, we only refresh if the slot has changed
        return storedState.lastRefreshSlot !== currentSlot;
    }
}
