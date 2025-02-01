import { error } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL = "https://api.themoviedb.org/3/movie"
const BASE_URL_SEARCH = "https://api.themoviedb.org/3"



export async function load({ params }) {
    let bollyhood_movie_id = params.bollyhood_movie_id;
    let url = `${BASE_URL}/${bollyhood_movie_id}?language=en-US&api_key=${API_KEY}`
    let bollyhood_movieData = await fetchWithCache(url, bollyhood_movie_id)
    return {
        "movie_id": bollyhood_movie_id,
        "bollyhood_movieData": bollyhood_movieData
    }
}

