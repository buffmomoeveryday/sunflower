import { command } from "$app/server";
import { error } from "@sveltejs/kit";
import { API_KEY } from "$lib/utils";
import * as v from "valibot";


export const search = command(v.string(), async (search) => {
    try {
        const page = 1
        const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(search)}&page=${page}&include_adult=false&language=en-US&api_key=${API_KEY}`;
        const response = await fetch(url)
        if (!response.ok) return error("No No No No")
        const data = await response.json()
        return {
            success: true,
            searchResults: data.results,
            total_pages: data.total_pages,
            current_page: data.page
        }
    } catch (error) {
        error(error)
    }
});