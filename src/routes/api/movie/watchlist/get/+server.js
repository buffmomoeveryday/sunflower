import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';
import PocketBase from 'pocketbase';

const url = 'http://localhost:8090';
const pb = new PocketBase(url);

export async function POST({ request, cookies }) {
    try {
        const { user_id, tmdb_id } = await request.json();
        const userIdString = user_id.toString();
        const resultList = await pb.collection('favourite_movies').getList(1, 50, {
            filter: `user_id="${userIdString}"`,
        });
        const result = await pb.collection('favourite_movies').getFirstListItem(`tmdb_id="${tmdb_id}"`)
        return json({ records: result }, { status: 200 });

    } catch (error) {

        console.error('Error fetching favourite series:', error);
        return json({ error: error.message || 'An error occurred' }, { status: 500 });
    }
}


