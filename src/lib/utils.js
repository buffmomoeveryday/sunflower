const cache = new Map();

export async function fetchWithCache(url, cacheKey, ttl = 300000) {
    const now = Date.now();
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (now - timestamp < ttl) {
            return data;
        }
    }
    const response = await fetch(url);
    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
}


export const API_KEY = "0a9e7f0d6a5dacc13c60776291c3edcc"
// export const POCKETBASE_URL = 'http://localhost:8090'
export const POCKETBASE_URL = 'https://sunflower-pocketbase.fly.dev'
export const PUBLIC_REDIRECT_URI = "/"