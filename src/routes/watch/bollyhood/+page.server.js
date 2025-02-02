import { fetchWithCache, API_KEY } from "$lib/utils"


export async function load({ params }) {
    const page = params.page || 1;
    const BASE_URL_SEARCH = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&region=IN&with_original_language=hi&vote_count.gte=100&page=${page}&append_to_response='video`;
    const bolyhoodData = await fetchWithCache(BASE_URL_SEARCH, "bolyhoodData");

    return {
        bolyhoodData,
    };
}
