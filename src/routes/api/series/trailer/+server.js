import { json } from '@sveltejs/kit';
import { API_KEY } from '$lib/utils.js';

const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(event) {
	try {
		const tmdb_id = event.url.searchParams.get('tmdb_id');
		if (!tmdb_id) {
			throw new Error("Missing tmdb_id in query params");
		}

		// Fetch videos + details + reviews in parallel
		const [videosRes, detailsRes, reviewsRes] = await Promise.all([
			fetch(`${BASE_URL}/tv/${tmdb_id}/videos?language=en-US&api_key=${API_KEY}`),
			fetch(`${BASE_URL}/tv/${tmdb_id}?language=en-US&api_key=${API_KEY}`),
			fetch(`${BASE_URL}/tv/${tmdb_id}/reviews?language=en-US&api_key=${API_KEY}`)
		]);

		if (!videosRes.ok || !detailsRes.ok || !reviewsRes.ok) {
			throw new Error("TMDB request failed");
		}

		const videos = await videosRes.json();
		const details = await detailsRes.json();
		const reviews = await reviewsRes.json();

		// Pick trailer key
		let trailer = null;
		for (const video of videos.results || []) {
			if (video.type === "Trailer" && video.site === "YouTube") {
				trailer = video.key;
				break;
			}
		}

		return json({
			success: true,
			key: trailer,
			details,
			reviews: reviews.results || []
		});
	} catch (error) {
		console.error(error);
		return json({ success: false, error: error.message });
	}
}
