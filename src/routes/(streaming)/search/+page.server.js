import { fetchGenres } from "$lib/services/tmdb.service";

export async function load() {
    const genres = await fetchGenres();
    return {
        genres
    };
}
