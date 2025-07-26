import { error } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL = 'https://api.themoviedb.org/3/movie';
const BASE_URL_SEARCH = 'https://api.themoviedb.org/3';

export async function load({ params }) {
	const popularMoviesUrl = `${BASE_URL}/now_playing?language=en-US&page=1&api_key=${API_KEY}`;
	const newReleasesUrl = `${BASE_URL}/popular?language=en-US&page=1&api_key=${API_KEY}`;

	const popularMoviesData = await fetchWithCache(popularMoviesUrl, 'popularMovies');
	const newReleasesData = await fetchWithCache(newReleasesUrl, 'newReleases');

	return { popularMoviesData: popularMoviesData, newReleasesData: newReleasesData };
}
