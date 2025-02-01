import { error } from '@sveltejs/kit';
import { fetchWithCache,API_KEY } from '$lib/utils.js';

const BASE_URL = "https://api.themoviedb.org/3/movie"
const BASE_URL_SEARCH = "https://api.themoviedb.org/3"



export async function load({ params }) {
    let movie_id = params.movie_id;
    let url = `${BASE_URL}/${movie_id}?language=en-US&api_key=${API_KEY}`
    let movieData = await fetchWithCache(url, movie_id)
    return {
        "movie_id": movie_id,
        "movieData": movieData
    }
}

