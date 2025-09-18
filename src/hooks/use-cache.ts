import { useCallback, useRef, useEffect } from 'react';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
    hits: number;
    lastAccessed: number;
}

interface CacheConfig {
    defaultTTL: number; // Default TTL in milliseconds
    maxSize: number; // Maximum number of items in cache
    cleanupInterval: number; // Cleanup interval in milliseconds
    enablePersistence: boolean; // Whether to persist cache to localStorage
    persistenceKey: string; // Key for localStorage persistence
}

const defaultConfig: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    cleanupInterval: 60 * 1000, // 1 minute
    enablePersistence: false,
    persistenceKey: 'app-cache',
};

export const useCache = <T = any>(config: Partial<CacheConfig> = {}) => {
    const finalConfig = { ...defaultConfig, ...config };
    const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
    const cleanupIntervalRef = useRef<NodeJS.Timeout>();

    // Load cache from localStorage on mount
    useEffect(() => {
        if (finalConfig.enablePersistence) {
            try {
                const stored = localStorage.getItem(finalConfig.persistenceKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const cache = new Map<string, CacheItem<T>>();

                    Object.entries(parsed).forEach(([key, value]) => {
                        const item = value as CacheItem<T>;
                        // Check if item is still valid
                        if (Date.now() - item.timestamp < item.ttl) {
                            cache.set(key, item);
                        }
                    });

                    cacheRef.current = cache;
                }
            } catch (error) {
                console.warn('Failed to load cache from localStorage:', error);
            }
        }
    }, [finalConfig.enablePersistence, finalConfig.persistenceKey]);

    // Save cache to localStorage
    const saveToStorage = useCallback(() => {
        if (!finalConfig.enablePersistence) return;

        try {
            const cacheObj = Object.fromEntries(cacheRef.current);
            localStorage.setItem(finalConfig.persistenceKey, JSON.stringify(cacheObj));
        } catch (error) {
            console.warn('Failed to save cache to localStorage:', error);
        }
    }, [finalConfig.enablePersistence, finalConfig.persistenceKey]);

    // Cleanup expired items
    const cleanup = useCallback(() => {
        const now = Date.now();
        const cache = cacheRef.current;

        for (const [key, item] of cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                cache.delete(key);
            }
        }

        // Remove oldest items if cache is too large
        if (cache.size > finalConfig.maxSize) {
            const entries = Array.from(cache.entries());
            entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

            const toRemove = entries.slice(0, cache.size - finalConfig.maxSize);
            toRemove.forEach(([key]) => cache.delete(key));
        }

        saveToStorage();
    }, [finalConfig.maxSize, saveToStorage]);

    // Set up cleanup interval
    useEffect(() => {
        cleanupIntervalRef.current = setInterval(cleanup, finalConfig.cleanupInterval);
        return () => {
            if (cleanupIntervalRef.current) {
                clearInterval(cleanupIntervalRef.current);
            }
        };
    }, [cleanup, finalConfig.cleanupInterval]);

    // Get item from cache
    const get = useCallback((key: string): T | null => {
        const item = cacheRef.current.get(key);

        if (!item) return null;

        const now = Date.now();

        // Check if item is expired
        if (now - item.timestamp > item.ttl) {
            cacheRef.current.delete(key);
            return null;
        }

        // Update access statistics
        item.hits++;
        item.lastAccessed = now;

        return item.data;
    }, []);

    // Set item in cache
    const set = useCallback((key: string, data: T, ttl?: number): void => {
        const now = Date.now();
        const item: CacheItem<T> = {
            data,
            timestamp: now,
            ttl: ttl || finalConfig.defaultTTL,
            hits: 0,
            lastAccessed: now,
        };

        cacheRef.current.set(key, item);
        saveToStorage();
    }, [finalConfig.defaultTTL, saveToStorage]);

    // Check if key exists and is valid
    const has = useCallback((key: string): boolean => {
        const item = cacheRef.current.get(key);
        if (!item) return false;

        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            cacheRef.current.delete(key);
            return false;
        }

        return true;
    }, []);

    // Delete item from cache
    const del = useCallback((key: string): boolean => {
        const deleted = cacheRef.current.delete(key);
        if (deleted) {
            saveToStorage();
        }
        return deleted;
    }, [saveToStorage]);

    // Clear all cache
    const clear = useCallback(() => {
        cacheRef.current.clear();
        saveToStorage();
    }, [saveToStorage]);

    // Get cache statistics
    const getStats = useCallback(() => {
        const cache = cacheRef.current;
        const now = Date.now();

        let totalHits = 0;
        let validItems = 0;
        let expiredItems = 0;

        for (const item of cache.values()) {
            if (now - item.timestamp > item.ttl) {
                expiredItems++;
            } else {
                validItems++;
                totalHits += item.hits;
            }
        }

        return {
            size: cache.size,
            validItems,
            expiredItems,
            totalHits,
            hitRate: validItems > 0 ? totalHits / validItems : 0,
        };
    }, []);

    // Get or set pattern
    const getOrSet = useCallback(async (
        key: string,
        fetcher: () => Promise<T>,
        ttl?: number
    ): Promise<T> => {
        const cached = get(key);
        if (cached !== null) {
            return cached;
        }

        const data = await fetcher();
        set(key, data, ttl);
        return data;
    }, [get, set]);

    // Invalidate cache by pattern
    const invalidatePattern = useCallback((pattern: string | RegExp): number => {
        const cache = cacheRef.current;
        let deletedCount = 0;

        for (const key of cache.keys()) {
            const matches = typeof pattern === 'string'
                ? key.includes(pattern)
                : pattern.test(key);

            if (matches) {
                cache.delete(key);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            saveToStorage();
        }

        return deletedCount;
    }, [saveToStorage]);

    return {
        get,
        set,
        has,
        del,
        clear,
        getStats,
        getOrSet,
        invalidatePattern,
        cleanup,
    };
};

// Hook for API caching
export const useApiCache = <T = any>(config?: Partial<CacheConfig>) => {
    const cache = useCache<T>(config);

    const cachedApiCall = useCallback(async (
        key: string,
        apiCall: () => Promise<T>,
        ttl?: number
    ): Promise<T> => {
        return cache.getOrSet(key, apiCall, ttl);
    }, [cache]);

    const invalidateApi = useCallback((endpoint: string) => {
        return cache.invalidatePattern(endpoint);
    }, [cache]);

    return {
        ...cache,
        cachedApiCall,
        invalidateApi,
    };
};

// Hook for component-specific caching
export const useComponentCache = <T = any>(
    componentName: string,
    config?: Partial<CacheConfig>
) => {
    const cache = useCache<T>(config);

    const getComponentData = useCallback((key: string): T | null => {
        return cache.get(`${componentName}:${key}`);
    }, [cache, componentName]);

    const setComponentData = useCallback((key: string, data: T, ttl?: number): void => {
        cache.set(`${componentName}:${key}`, data, ttl);
    }, [cache, componentName]);

    const hasComponentData = useCallback((key: string): boolean => {
        return cache.has(`${componentName}:${key}`);
    }, [cache, componentName]);

    const clearComponentCache = useCallback(() => {
        cache.invalidatePattern(`${componentName}:`);
    }, [cache, componentName]);

    return {
        ...cache,
        getComponentData,
        setComponentData,
        hasComponentData,
        clearComponentCache,
    };
};
