import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

const url = 'http://localhost:8090';
const pb = new PocketBase(url);

export async function POST({ request, cookies }) {

    try {
        const { user_id } = await request.json();
        const resultList = await pb.collection('favourite_movies').getList(1, 50, {
            filter: `user_id="${user_id}"`,
        });
        return json({ records: resultList }, { status: 200 });

    } catch (error) {

        console.error('Error fetching favourite movies:', error);
        return json({ error: error.message || 'An error occurred' }, { status: 500 });
    }
}


