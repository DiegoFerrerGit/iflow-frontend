import { Injectable } from '@angular/core';
import { CacheEntry } from './models/interfaces/cache-entry.model';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class CacheManager {
    private readonly storage: Storage = sessionStorage;
    private readonly PREFIX = 'iflow_cache_';
    private readonly SECRET_KEY = environment.cacheSecretKey || 'fallback_secret_key';
    private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.startAutoCleanup();
    }

    /**
     * Periodically scans and removes expired entries from storage.
     */
    private startAutoCleanup(): void {
        setInterval(() => this.cleanExpired(), this.CLEANUP_INTERVAL_MS);
    }

    /**
     * Scans all keys with the cache prefix and removes expired ones.
     * Only triggers if storage is nearly full (> 4MB).
     */
    private cleanExpired(): void {
        const threshold = 4 * 1024 * 1024; // 4MB
        if (this.getStorageSize() < threshold) return;

        console.info('[CacheManager] Storage usage high, running cleanup...');
        const now = Date.now();
        const keysToRemove: string[] = [];

        try {
            for (let i = 0; i < this.storage.length; i++) {
                const fullKey = this.storage.key(i);
                if (fullKey && fullKey.startsWith(this.PREFIX)) {
                    const rawData = this.storage.getItem(fullKey);
                    if (!rawData) continue;

                    const decryptedData = this.decrypt(rawData);
                    if (!decryptedData) {
                        keysToRemove.push(fullKey);
                        continue;
                    }

                    const entry: CacheEntry<unknown> = JSON.parse(decryptedData);
                    if (now > entry.expiry) {
                        keysToRemove.push(fullKey);
                    }
                }
            }

            keysToRemove.forEach(key => this.storage.removeItem(key));
            if (keysToRemove.length > 0) {
                console.info(`[CacheManager] Auto-cleanup: Removed ${keysToRemove.length} expired entries.`);
            }
        } catch (error) {
            console.error('[CacheManager] Auto-cleanup failed:', error);
        }
    }

    /**
     * Estimates current storage usage in bytes.
     */
    public getStorageSize(): number {
        let total = 0;
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key) {
                total += key.length + (this.storage.getItem(key)?.length || 0);
            }
        }
        return total * 2; // UTF-16
    }

    /**
     * Clears all session storage completely.
     */
    public clearAll(): void {
        this.storage.clear();
    }

    /**
     * Stores data in sessionStorage with a TTL.
     * 
     * @param key Unique key for the cache entry
     * @param value Data to store
     * @param ttlInMinutes Time to live in minutes
     */
    public set<T>(key: string, value: T, ttlInMinutes: number): void {
        try {
            const now = Date.now();
            const expiry = now + ttlInMinutes * 60 * 1000;
            const entry: CacheEntry<T> = {
                data: value,
                expiry,
                createdAt: now,
                version: '1.0'
            };

            const serializedData = JSON.stringify(entry);
            const encryptedData = this.encrypt(serializedData);
            
            this.storage.setItem(`${this.PREFIX}${key}`, encryptedData);
        } catch (error) {
            console.error('Error setting cache:', error);
        }
    }

    /**
     * Retrieves data from sessionStorage if it exists and hasn't expired.
     * 
     * @param key Unique key for the cache entry
     * @returns The cached data or null if not found or expired
     */
    public get<T>(key: string): T | null {
        try {
            const rawData = this.storage.getItem(`${this.PREFIX}${key}`);
            if (!rawData) return null;

            const decryptedData = this.decrypt(rawData);
            if (!decryptedData) return null;

            const entry: CacheEntry<T> = JSON.parse(decryptedData);

            if (Date.now() > entry.expiry) {
                this.clear(key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error('Error getting cache:', error);
            this.clear(key);
            return null;
        }
    }

    /**
     * Removes a specific entry from the cache.
     * 
     * @param key Unique key for the cache entry
     */
    public clear(key: string): void {
        this.storage.removeItem(`${this.PREFIX}${key}`);
    }

    /**
     * Removes all cache entries that start with a given prefix.
     * 
     * @param prefix Prefix to search for
     */
    public clearByPrefix(prefix: string): void {
        const fullPrefix = `${this.PREFIX}${prefix}`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(fullPrefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => this.storage.removeItem(key));
    }

    /**
     * Encrypts data using AES.
     */
    private encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    }

    /**
     * Decrypts data using AES.
     * Returns empty string if decryption fails.
     */
    private decrypt(data: string): string {
        try {
            const bytes = CryptoJS.AES.decrypt(data, this.SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Cache decryption failed:', error);
            return '';
        }
    }
}
