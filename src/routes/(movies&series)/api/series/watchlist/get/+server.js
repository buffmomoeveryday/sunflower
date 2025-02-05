import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY, POCKETBASE_URL } from '$lib/utils.js';
import PocketBase from 'pocketbase';


export async function POST({ request, cookies }) {
    try {
        const pb = new PocketBase(POCKETBASE_URL);
        const { user_id, tmdb_id } = await request.json();
        const userIdString = user_id.toString();
        const resultList = await pb.collection('favourite_series').getList(1, 50, {
            filter: `user_id="${userIdString}"`,
        });
        const result = await pb.collection('favourite_series').getFirstListItem(`tmdb_id="${tmdb_id}"`)
        return json({ records: result }, { status: 200 });
    } catch (error) {
        console.error('Error fetching favourite series:', error);
        return json({ error: error.message || 'An error occurred' }, { status: 500 });
    }
}


