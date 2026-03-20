import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheManager } from '../cache.manager';
import { CACHE_KEY, CACHE_TTL } from '../models/constants/cache.constants';

/**
 * Cache Interceptor to handle GET caching and mutation invalidation.
 * 
 * Order: Loader (before) -> Cache (this) -> Auth (after)
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
    try {
        const key = req.context.get(CACHE_KEY);
        const ttl = req.context.get(CACHE_TTL);
        
        // Skip if no cache key is provided
        if (!key) {
            return next(req);
        }

        const cacheManager = inject(CacheManager);

        // 1. Logic for GET: Return from cache or save on success
        if (req.method === 'GET') {
            const getKey = Array.isArray(key) ? key[0] : key;
            if (!getKey) return next(req);

            const cachedData = cacheManager.get(getKey);

            if (cachedData !== null) {
                return of(new HttpResponse({
                    body: cachedData,
                    status: 200,
                    statusText: 'OK (from cache)',
                    url: req.url
                }));
            }

            return next(req).pipe(
                tap(event => {
                    if (event instanceof HttpResponse && event.ok) {
                        cacheManager.set(getKey, event.body, ttl);
                    }
                })
            );
        }

        // 2. Logic for Mutations (POST, PUT, DELETE, PATCH): Invalidate cache key on success
        const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (mutationMethods.includes(req.method)) {
            return next(req).pipe(
                tap(event => {
                    if (event instanceof HttpResponse && event.ok) {
                        const keysToClear = Array.isArray(key) ? key : [key];
                        keysToClear.forEach(k => {
                            if (k) cacheManager.clear(k);
                        });
                    }
                })
            );
        }
    } catch (error) {
        // If anything fails in the cache logic, just proceed with the request
        console.error('Cache interceptor error:', error);
    }

    return next(req);
};
