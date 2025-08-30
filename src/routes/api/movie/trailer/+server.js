import { json } from '@sveltejs/kit';
import { API_KEY } from '$lib/utils.js';

const BASE_URL_SEARCH = 'https://api.themoviedb.org/3';

export async function GET(event) {
    try {
        const tmdb_id = event.url.searchParams.get('tmdb_id');
        if (!tmdb_id) {
            throw new Error("Missing tmdb_id in query params");
        }

        const url = `${BASE_URL_SEARCH}/movie/${tmdb_id}/videos?language=en-US&api_key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`TMDB request failed: ${response.status}`);
        }

        const videos = await response.json();
        let trailer = null;

        for (const video of videos.results || []) {
            if (video.type === "Trailer" && video.site === "YouTube") {
                trailer = video.key;
                break;
            }
        }

        return json({ success: true, key: trailer });
    } catch (error) {
        console.error(error);
        return json({ success: false, error: error.message });
    }
}
