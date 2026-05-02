import { command } from '$app/server';
import * as v from 'valibot';


const BASE_URL = "https://streamed.pk/api";

export const getSports = command(v.any(), async () => {
    try {
        const response = await fetch(`${BASE_URL}/sports`);
        if (!response.ok) throw new Error("Failed to fetch sports");
        return await response.json();
    } catch (error) {
        console.error("Error fetching sports:", error);
        return [];
    }
});

export const getMatches = command(v.optional(v.string(), "live"), async (category) => {
    try {
        const url = category === "live" 
            ? `${BASE_URL}/matches/live` 
            : `${BASE_URL}/matches/${category}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch matches");
        return await response.json();
    } catch (error) {
        console.error("Error fetching matches:", error);
        return [];
    }
});

export const getStreams = command(
    v.object({
        source: v.string(),
        id: v.string()
    }),
    async ({ source, id }) => {
        try {
            const response = await fetch(`${BASE_URL}/stream/${source}/${id}`);
            if (!response.ok) throw new Error("Failed to fetch streams");
            return await response.json();
        } catch (error) {
            console.error("Error fetching streams:", error);
            return [];
        }
    }
);
