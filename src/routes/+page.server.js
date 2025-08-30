import { error } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL = 'https://api.themoviedb.org/3/movie';
const BASE_URL_TRENDING = 'https://api.themoviedb.org/3/trending';

export async function load({ params }) {
	const popularMoviesUrl = `${BASE_URL}/now_playing?language=en-US&page=1&api_key=${API_KEY}`;
	const newReleasesUrl = `${BASE_URL}/popular?language=en-US&page=1&api_key=${API_KEY}`;
	const trendingMoviesUrl = `${BASE_URL_TRENDING}/all/day?language=en-US&page=1&api_key=${API_KEY}`;

	const popularMoviesData = await fetchWithCache(popularMoviesUrl, 'popularMovies');
	const newReleasesData = await fetchWithCache(newReleasesUrl, 'newReleases');
	const trendingMoviesData = await fetchWithCache(trendingMoviesUrl, "trendingMovies");

	return { popularMoviesData, newReleasesData, trendingMoviesData };
}
