import { command } from "$app/server";
import * as v from "valibot";
import { fetchGenres } from "$lib/services/tmdbService";

export const getGenres = command(v.optional(v.any()), async () => {
    return await fetchGenres();
});
