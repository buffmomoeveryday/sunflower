import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL_SEARCH = "https://api.themoviedb.org/3";

export async function POST(event) {
    try {
        const data = await event.request.formData();
        const search = data.get('search');
        const page = parseInt(data.get('page')) || 1;
        const videoType = data.get("videoType")

        if (!search) {
            return json({ success: false, error: "Search query is required" });
        }

        const url = `${BASE_URL_SEARCH}/search/${videoType}?query=${encodeURIComponent(search)}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`;

        const searchResults = await fetchWithCache(
            url,
            `search=${encodeURIComponent(search)}&page=${page}&type=${videoType}`
        );

        // console.log(url)

        return json({
            success: true,
            searchResults: searchResults.results,
            total_pages: searchResults.total_pages,
            current_page: page
        });
    } catch (error) {
        return json({ success: false, error: "Failed to fetch search results" });
    }
}
