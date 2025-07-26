import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL_SEARCH = 'https://api.themoviedb.org/3';

export async function GET(event) {
	try {
		return json({
			success: true
		});
	} catch (error) {
		return json({ success: false, error: 'Failed to fetch search results' });
	}
}
