import { command } from "$app/server";
import * as v from "valibot";
import { fetchDiscover } from "$lib/services/tmdbService";

const DiscoverSchema = v.object({
    type: v.string(),
    genreIds: v.optional(v.array(v.union([v.string(), v.number()])), []),
    yearFrom: v.optional(v.string()),
    yearTo: v.optional(v.string()),
    page: v.optional(v.number(), 1)
});

export const discover = command(DiscoverSchema, async ({ type, genreIds, yearFrom, yearTo, page = 1 }) => {
    return await fetchDiscover(type, genreIds, yearFrom, yearTo, page);
});
