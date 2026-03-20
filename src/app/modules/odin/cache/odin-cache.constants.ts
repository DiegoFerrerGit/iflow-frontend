import { HttpContext } from '@angular/common/http';
import { CACHE_KEY, CACHE_TTL } from '../../../core/cache/models/constants/cache.constants';
import { HIDE_SPINNER } from '../../../core/interceptors/models/constants/interceptors.constants';
import { environment } from '../../../../environments/environment';

export const CACHE_SCOPES = {
    ODIN: 'odin',
    ODIN_BOX: 'odin_box',
    ODIN_SUBCATEGORY: 'odin_sub'
} as const;

// PREDEFINED OPTIONS (STATICS)
export const ODIN_CACHE_GET_OPTIONS = {
    context: new HttpContext()
        .set(CACHE_KEY, CACHE_SCOPES.ODIN)
        .set(CACHE_TTL, environment.defaultCacheTtl)
};

export const ODIN_CACHE_INVALIDATE_OPTIONS = {
    context: new HttpContext()
        .set(CACHE_KEY, CACHE_SCOPES.ODIN)
        .set(HIDE_SPINNER, true)
};

// DYNAMIC OPTION HELPERS (LEVEL 2)

/**
 * Gets cache options for a specific allocation box detail.
 */
export const GET_BOX_DETAIL_CACHE = (id: string) => ({
    context: new HttpContext()
        .set(CACHE_KEY, `${CACHE_SCOPES.ODIN_BOX}_${id}`)
        .set(CACHE_TTL, environment.defaultCacheTtl)
});

/**
 * Gets invalidation options for a specific allocation box.
 * Also invalidates the main ODIN cache as boxes are children of it.
 * NOTE: For now our interceptor handles one key. 
 * If we need to invalidate multiple, we'd need to extend the interceptor.
 * But usually clearing the specific box is enough for detail view.
 */
export const INVALIDATE_BOX_CACHE = (id: string) => ({
    context: new HttpContext()
        .set(CACHE_KEY, [
            `${CACHE_SCOPES.ODIN_BOX}_${id}`,
            CACHE_SCOPES.ODIN // Invalidate parent dashboard
        ])
        .set(HIDE_SPINNER, true)
});

/**
 * Gets cache options for specific subcategory details.
 */
export const GET_SUBCATEGORY_DETAIL_CACHE = (boxId: string, subId: string) => ({
    context: new HttpContext()
        .set(CACHE_KEY, `${CACHE_SCOPES.ODIN_SUBCATEGORY}_${boxId}_${subId}`)
        .set(CACHE_TTL, environment.defaultCacheTtl)
});

/**
 * Gets invalidation options for professional subcategory.
 * Clears item-level, subcategory-level, box-level, and main dashboard caches.
 */
export const INVALIDATE_SUBCATEGORY_CACHE = (boxId: string, subId: string) => ({
    context: new HttpContext()
        .set(CACHE_KEY, [
            `${CACHE_SCOPES.ODIN_SUBCATEGORY}_${boxId}_${subId}`,
            `${CACHE_SCOPES.ODIN_BOX}_${boxId}`,
            CACHE_SCOPES.ODIN
        ])
        .set(HIDE_SPINNER, true)
});

export const ODIN_CACHE_OPTIONS = {
    KEYS: {
        TOTAL_POOL: 'odin_total_pool',
        ALLOCATION_BOXES: 'odin_allocation_boxes',
        BOX_TYPE: (boxId: string) => `odin_box_type_${boxId}`
    }
};
