import { command } from "$app/server";
import * as v from "valibot";

export const searchSemantic = command(v.string(), async (query) => {
    try {
        const response = await fetch('https://movies-semantic-search.vercel.app/', {
            method: 'POST',
            headers: {
                'accept': 'text/x-component',
                'content-type': 'text/plain;charset=UTF-8',
                'next-action': 'fa7be418d90d522ca5886e42a2c2a254261865a9',
            },
            body: JSON.stringify([query])
        });

        if (!response.ok) {
            return { success: false, error: "Failed to fetch from semantic search API" };
        }

        const text = await response.text();
        const match = text.match(/1:(\{.*\})/);
        
        if (match) {
            const data = JSON.parse(match[1]);
            if (data.code === "SUCCESS") {
                const results = data.movies.map(m => {
                    const isTv = m.id.startsWith('tv:');
                    return {
                        id: isTv ? m.metadata.series_id : m.metadata.movie_id,
                        media_type: isTv ? 'tv' : 'movie',
                        name: m.metadata.name,
                        title: m.metadata.name,
                        poster_path: m.metadata.poster_link?.split('/w500')[1] || "",
                        vote_average: m.metadata.vote_average,
                        release_date: m.metadata.release_year,
                        first_air_date: m.metadata.first_air_year,
                        genre_ids: []
                    };
                });
                return {
                    success: true,
                    searchResults: results,
                    total_pages: 1,
                    current_page: 1
                };
            }
        }
        
        return { success: false, error: "No results found or invalid response." };
    } catch (err) {
        console.error("Semantic search error:", err);
        return { success: false, error: "Service unavailable." };
    }
});
