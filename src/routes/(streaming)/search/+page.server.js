import { fetchGenres } from "$lib/services/tmdbService";

export async function load() {
    const genres = await fetchGenres();
    return {
        genres
    };
}
