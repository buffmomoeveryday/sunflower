import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL_SEARCH = 'https://api.themoviedb.org/3';

export async function POST(event) {
	try {
		const data = await event.request.formData();
		const search = data.get('search');
		const page = parseInt(data.get('page')) || 1; // Default to page 1 if not provided

		if (!search) {
			return json({ success: false, error: 'Search query is required' });
		}

		const url = `${BASE_URL_SEARCH}/search/${type}?query=${encodeURIComponent(search)}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`;
		const searchResults = await fetchWithCache(url, `${search}_page${page}`);

		return json({
			success: true,
			searchResults: searchResults.results, // Extract only the movie results
			total_pages: searchResults.total_pages, // Send total pages for frontend pagination
			current_page: page
		});
	} catch (error) {
		return json({ success: false, error: 'Failed to fetch search results' });
	}
}
