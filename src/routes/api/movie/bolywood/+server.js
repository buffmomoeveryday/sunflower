import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

export async function POST({ request }) {
    try {
        // Safely extract page with a default value of 1
        const { page = 1 } = (await request.json()) || {};

        // Construct the API URL with the page value
        const BASE_URL_SEARCH = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&region=IN&with_original_language=hi&vote_count.gte=100&without_genres=99&page=${page}`;

        // Fetch data using the caching utility
        const tmdbResponse = await fetchWithCache(BASE_URL_SEARCH, `bolyhoodPage${page}`);

        // Return the response as JSON with the correct structure
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