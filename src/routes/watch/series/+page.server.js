import { fetchWithCache, API_KEY } from '$lib/utils.js';


export async function load({ params }) {
    const trendingSeriesUrl = `https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}&language=en-US`;
    const topRatedUrl = `https://api.themoviedb.org/3/tv/top_rated?language=en-US&api_key=${API_KEY}`;

    const options = { method: 'GET', headers: { accept: 'application/json' } };

    let trendingSeries = await fetchWithCache(trendingSeriesUrl, 'trendingSeries')
    let topRatedSeries = await fetchWithCache(topRatedUrl, "topRatedSeries")

    return {
        trendingSeries: trendingSeries,
        topRatedSeries: topRatedSeries,
    }

}
