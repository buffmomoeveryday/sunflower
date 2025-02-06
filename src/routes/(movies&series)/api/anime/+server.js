import { json } from '@sveltejs/kit'
import { fetchWithCache, API_KEY } from '$lib/utils.js';

export async function POST({ request }) {
    try {
        const { page = 1 } = (await request.json()) || {};
        let animeSearchUrl =
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=1&with_genres=16&with_keywords=210024|287501&page=${page}`;
        const tmdbResponse = await fetchWithCache(animeSearchUrl, `animePages${page}`);
        return json({
            success: true,
            results: tmdbResponse.results,
            total_pages: tmdbResponse.total_pages,
            current_page: page
        });
    } catch (error) {
        console.error('Error in /api/movie/bolywood:', error);
        return json(
            {
                success: false,
                error: 'Failed to fetch search results',
                results: [],
                total_pages: 0,
                current_page: 0
            },
            { status: 500 }
        );
    }
}