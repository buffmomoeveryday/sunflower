import { fetchWithCache, API_KEY } from '$lib/utils.js';

/**
 * TMDB has no dedicated "anime" media type. TV + filters approximate Japanese anime:
 * genre 16 = Animation, with_original_language=ja = Japanese primary language.
 * (Some titles may be missing or western animation in Japanese — tune filters if needed.)
 */
export async function load() {
	const base = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&include_adult=false&with_genres=16&with_original_language=ja`;

	const popularAnimeUrl = `${base}&sort_by=popularity.desc&page=1`;
	const topRatedAnimeUrl = `${base}&sort_by=vote_average.desc&vote_count.gte=150&page=1`;
	const recentAnimeUrl = `${base}&sort_by=first_air_date.desc&page=1`;

	const [popularAnime, topRatedAnime, recentAnime] = await Promise.all([
		fetchWithCache(popularAnimeUrl, 'tmdbAnimePopularJa'),
		fetchWithCache(topRatedAnimeUrl, 'tmdbAnimeTopRatedJa'),
		fetchWithCache(recentAnimeUrl, 'tmdbAnimeRecentJa')
	]);

	return {
		popularAnime,
		topRatedAnime,
		recentAnime
	};
}
