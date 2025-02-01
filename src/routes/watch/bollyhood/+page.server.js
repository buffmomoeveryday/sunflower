import { fetchWithCache, API_KEY } from "$lib/utils"


export async function load({ params }) {

    let page = params.page | 1;
    const BASE_URL_SEARCH = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=hi-IN&region=IN&sort_by=popularity.desc&page=1&with_original_language=hi`
    let url = `${BASE_URL_SEARCH}`
    let bolyhoodData = await fetchWithCache(url, "bolyhoodData")
    return {
        "bolyhoodData": bolyhoodData
    }
}
