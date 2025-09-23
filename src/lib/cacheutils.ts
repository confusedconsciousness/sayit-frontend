export type CacheEntry<T> = { data: T; timestamp: number };

const CACHE_DURATION = 60_000 * 5; // 1 min in milliseconds
const genericCache: Record<string, CacheEntry<any>> = {};

export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    cacheDuration: number = CACHE_DURATION
): Promise<T> {
    const now = Date.now();
    const cached = genericCache[key];
    if (cached && now - cached.timestamp < cacheDuration) {
        return cached.data;
    }
    const data = await fetcher();
    genericCache[key] = {data, timestamp: now};
    return data;
}

export function invalidateCache(key: string) {
    delete genericCache[key];
}
