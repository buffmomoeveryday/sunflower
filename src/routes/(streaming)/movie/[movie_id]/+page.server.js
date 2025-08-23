import { error } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL = 'https://api.themoviedb.org/3/movie';
const BASE_URL_SEARCH = 'https://api.themoviedb.org/3';

export async function load({ params }) {
	let movie_id = params.movie_id;

	let url = `${BASE_URL}/${movie_id}?language=en-US&api_key=${API_KEY}&append_to_response=videos`;
	let recommendation_url = `https://api.themoviedb.org/3/movie/${movie_id}/recommendations?language=en-US&page=1&api_key=${API_KEY}`;

	let movieData = await fetchWithCache(url, movie_id);
	let recommendation_data = await fetchWithCache(recommendation_url, `${movie_id}-recommendation`);
	
	return {
		 movie_id,
		 movieData,
		 recommendation_data
	};
}
