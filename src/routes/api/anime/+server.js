import { json } from '@sveltejs/kit'
import { fetchWithCache, API_KEY } from '$lib/utils.js';



export async function POST(event) {

    let serachResults = []
    const page = 1;
    try {
        const data = await event.request.formData();
        const search = data.get("search")
        if (!search) {
            return { success: false, error: "Search query is required" };
        }
        let animeSearchUrl =
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=1&with_genres=16&with_keywords=210024|287501&with_text_query=${search}`;

        serachResults = await fetchWithCache(animeSearchUrl, search)
        return json({ success: true, searchResults: serachResults })

    } catch (error) {
        console.log(error)
        return json({ success: false, error: error })
    }

}