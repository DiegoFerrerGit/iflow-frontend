import { TestBed } from '@angular/core/testing';
import { CacheManager } from '../cache.manager';

describe('CacheManager', () => {
    let service: CacheManager;

    beforeEach(() => {
        service = new CacheManager();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get values', () => {
        const key = 'test-key';
        const data = { foo: 'bar' };
        service.set(key, data, 5);
        expect(service.get(key)).toEqual(data);
    });

    it('should return null if expired', () => {
        const key = 'expired-key';
        const data = { foo: 'bar' };
        
        // Mocking Date.now to test expiry
        const now = Date.now();
        const spy = vi.spyOn(Date, 'now');
        
        spy.mockReturnValue(now);
        service.set(key, data, 1); // 1 minute
        
        // Move time forward 61 seconds
        spy.mockReturnValue(now + 61 * 1000);
        
        expect(service.get(key)).toBeNull();
        spy.mockRestore();
    });

    it('should clear a specific key', () => {
        const key = 'clear-key';
        service.set(key, 'data', 5);
        service.clear(key);
        expect(service.get(key)).toBeNull();
    });

    it('should clear by prefix', () => {
        service.set('user_1', 'data1', 5);
        service.set('user_2', 'data2', 5);
        service.set('other_3', 'data3', 5);

        service.clearByPrefix('user');

        expect(service.get('user_1')).toBeNull();
        expect(service.get('user_2')).toBeNull();
        expect(service.get('other_3')).toEqual('data3');
    });
});
