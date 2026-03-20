export interface CacheEntry<T> {
    data: T;
    expiry: number;
    createdAt: number;
    version: string;
}
