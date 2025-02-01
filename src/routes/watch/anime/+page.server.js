import { error } from '@sveltejs/kit';
import { fetchWithCache,API_KEY } from '$lib/utils.js';

const BASE_URL = "https://api.themoviedb.org/3/movie"
// const BASE_URL_SEARCH = "https://api.themoviedb.org/3"
const BASE_URL_SEARCH = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=1&with_genres=16&with_keywords=210024|287501`;



export async function load({ params }) {

    let page = params.page | 1;

    const BASE_URL_SEARCH = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&with_genres=16&with_keywords=210024|287501`;

    let url = `${BASE_URL_SEARCH}`
    let animeData = await fetchWithCache(url, "animeData")
    return {
        "animeData": animeData
    }
}

