import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL = 'https://api.themoviedb.org/3';

export async function POST(event) {
	try {
		const data = await event.request.formData();
		const tv_id = data.get('tv_id');
		const season_number = data.get('season_number');

		if (!tv_id || !season_number) {
			return json({ success: false, error: 'TV ID and Season Number are required' });
		}

		const url = `${BASE_URL}/tv/${tv_id}/season/${season_number}?api_key=${API_KEY}&language=en-US`;
		// const seasonDetails = fetchWithCache(url, `${tv_id}_season${season_number}`);
		const seasonDetails = await fetch(url).then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		});

		return json({
			success: true,
			episodes: seasonDetails.episodes
		});
	} catch (error) {
		return json({ success: false, error: 'Failed to fetch season episodes' });
	}
}
