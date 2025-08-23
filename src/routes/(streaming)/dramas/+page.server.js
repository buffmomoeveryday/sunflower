import { fetchWithCache, API_KEY } from '$lib/utils.js';

export async function load({ params }) {
	const baseDiscoverUrl = 'https://api.themoviedb.org/3/discover/tv';
	const searchUrl = 'https://api.themoviedb.org/3/search/tv';

	// Korean TV series using discover endpoint with origin country filter
	const koreanTrendingUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=popularity.desc&with_origin_country=KR`;
	const koreanTopRatedUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=50&with_origin_country=KR`;
	const koreanPopularUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=popularity.desc&with_origin_country=KR&page=1`;

	const koreanKeywordSearchUrl = `${searchUrl}?api_key=${API_KEY}&query=korean drama&language=ko-KR`;
	const koreanLanguageUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=popularity.desc&with_original_language=ko`;

	let koreanTrendingSeries = await fetchWithCache(koreanTrendingUrl, 'koreanTrendingDramas');
	let koreanTopRatedSeries = await fetchWithCache(koreanTopRatedUrl, 'koreanTopRatedDramas');
	let koreanPopularSeries = await fetchWithCache(koreanPopularUrl, 'koreanPopularDramas');
	// let koreanKeywordResults = await fetchWithCache(koreanKeywordSearchUrl, 'koreanKeywordSearch');
	// let koreanLanguageSeries = await fetchWithCache(koreanLanguageUrl, 'koreanLanguageDramas');

	// Your existing general content
	// const trendingSeriesUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=popularity.desc`;
	// const topRatedUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=100`;
	// const popularUrl = `${baseDiscoverUrl}?api_key=${API_KEY}&sort_by=popularity.desc&page=1`;

	// let trendingSeries = await fetchWithCache(trendingSeriesUrl, 'trendingDramas');
	// let topRatedSeries = await fetchWithCache(topRatedUrl, 'topRatedDramas');
	// let popularSeries = await fetchWithCache(popularUrl, `popularDramas-${Date.now()}`);

	return {
		// Korean content
		trendingSeries: koreanTrendingSeries,
		topRatedSeries: koreanTopRatedSeries,
		popularSeries: koreanPopularSeries
		// koreanKeywordResults,
		// koreanLanguageSeries,
		//
		// trendingSeries,
		// topRatedSeries,
		// popularSeries
	};
}
