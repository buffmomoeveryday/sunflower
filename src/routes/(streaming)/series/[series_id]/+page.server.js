import { fetchWithCache, API_KEY } from '$lib/utils';
import { redirectIfSavedSeriesProgress } from '$lib/server/seriesHistoryRedirect.js';

export async function load({ params, locals, url }) {
	let series_id = params.series_id;
	await redirectIfSavedSeriesProgress(url, locals, series_id);

	let seriesDetailUrl = `https://api.themoviedb.org/3/tv/${series_id}?api_key=${API_KEY}`;
	let seriesDetailData = await fetchWithCache(seriesDetailUrl, `seriesDetail-${series_id}`);

	return {
		series_id: series_id,
		seriesDetailData: seriesDetailData
	};
}
