import { error, json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY, POCKETBASE_URL } from '$lib/utils.js';
import PocketBase from 'pocketbase';



export async function POST({ request, cookies }) {
    const { user_id, tmdb_id, title, poster_path, average_ratings } = await request.json();

    try {
        const pb = new PocketBase(POCKETBASE_URL);
        let existingRecord;
        try {
            existingRecord = await pb.collection('favourite_movies').getFirstListItem(
                `user_id = "${user_id}" && tmdb_id = "${tmdb_id}"`
            );
        } catch (_) {
        }

        if (existingRecord) {
            try {
                const pb = new PocketBase(POCKETBASE_URL);
                await pb.collection('favourite_movies').delete(existingRecord.id);
                return json({ success: true, action: 'removed' }, { status: 200 });
            } catch (error) {
                ("Error deleting the record:", error);
                return json({ success: false, error: error.message }, { status: 500 });
            }
        } else {
            const data = {
                user_id,
                tmdb_id,
                title,
                poster_path,
                average_ratings
            };

            try {
                const pb = new PocketBase(POCKETBASE_URL);

                const record = await pb.collection('favourite_movies').create(data);
                return json({ success: true, action: 'added', id: record.id }, { status: 201 });
            } catch (error) {
                return json({ success: false, error: error.message }, { status: 500 });
            }
        }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}



// export async function DELETE({ request }) {
//     const { id, user_id } = await request.json();
//     try {
//         const series = await pb.collection("favourite_movies").getFirstListItem(
//             `tmdb_id="${id}" && user_id="${user_id}"`
//         );
//         if (!series) {
//             return json({ success: false, error: 'Series not found' }, { status: 404 });
//         }
//         await pb.collection("favourite_movies").delete(series.id);
//         return json({ success: true }, { status: 201 });
//     } catch (error) {
//         console.error('Error deleting series:', error);
//         return json({ success: false, error: error.message || 'An error occurred' }, { status: 500 });
//     }
// }

