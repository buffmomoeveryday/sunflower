import { API_KEY } from '$env/static/private';

const cache = new Map();

export async function fetchWithCache(url, cacheKey, ttl = 300000) {
	const now = Date.now();
	if (cache.has(cacheKey)) {
		const { data, timestamp } = cache.get(cacheKey);
		if (now - timestamp < ttl) {
			return data;
		}
	}
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		const data = await response.json();
		cache.set(cacheKey, { data, timestamp: now });
		return data;
	} catch (err) {
		console.error("Fetch error:", err.message);
		return null;
	}
}

export const API_KEY = API_KEY;
export const POCKETBASE_URL = "https://sunflower-pocketbase.fly.dev";
export const PUBLIC_REDIRECT_URI = '/';
