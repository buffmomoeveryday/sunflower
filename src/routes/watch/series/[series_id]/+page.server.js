import { fetchWithCache, API_KEY } from '$lib/utils';

export async function load({ params }) {

    let series_id = params.series_id;
    let seriesDetailUrl = `https://api.themoviedb.org/3/tv/${series_id}?api_key=${API_KEY}`

    let seriesDetailData = await fetchWithCache(seriesDetailUrl, `seriesDetail-${series_id}`)
    

    return {
        series_id: series_id,
        seriesDetailData: seriesDetailData,
    }


}