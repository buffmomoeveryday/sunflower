import { error, json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY, POCKETBASE_URL } from '$lib/utils.js';
import PocketBase from 'pocketbase';



export async function POST({ request, cookies }) {
    const { user_id, tmdb_id, season_id, episode_id, title, poster_path, average_ratings } = await request.json();

    try {

        let existingRecord;
        try {
            const pb = new PocketBase(POCKETBASE_URL);
            existingRecord = await pb.collection('favourite_series').getFirstListItem(
                `user_id = "${user_id}" && tmdb_id = "${tmdb_id}" && season_id = "${season_id}"`
            );
        } catch (error) {
        }

        const data = {
            "user_id": user_id,
            "tmdb_id": tmdb_id,
            "season_id": season_id,
            "episode_id": episode_id,
            "title": title,
            "poster_path": poster_path,
            "average_ratings": average_ratings
        };

        if (existingRecord) {
            try {
                const pb = new PocketBase(POCKETBASE_URL);
                const updatedRecord = await pb.collection('favourite_series').update(existingRecord.id, data);
                return json({ "id": updatedRecord.id }, { status: 200 });
            } catch (error) {
                ("Error updating the record:", error);
                return json({ success: false, "error": error.message }, { status: 500 });
            }
        } else {
            try {
                const pb = new PocketBase(POCKETBASE_URL);
                const record = await pb.collection('favourite_series').create(data);
                return json({ "id": record.id }, { status: 201 });
            } catch (error) {
                return json({ success: false, "error": error.message }, { status: 500 });
            }
        }
    } catch (error) {
        return json({ success: false, "error": error.message }, { status: 500 });
    }
}


export async function DELETE({ request }) {
    const { id, user_id } = await request.json();
    try {
        const pb = new PocketBase(POCKETBASE_URL);
        const series = await pb.collection("favourite_series").getFirstListItem(
            `tmdb_id="${id}" && user_id="${user_id}"`
        );
        if (!series) {
            return json({ success: false, error: 'Series not found' }, { status: 404 });
        }
        await pb.collection("favourite_series").delete(series.id);
        return json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error deleting series:', error);
        return json({ success: false, error: error.message || 'An error occurred' }, { status: 500 });
    }
}

export async function PATCH({ request }) {
    try {
        const pb = new PocketBase(POCKETBASE_URL);
        const requestData = await request.json();
        if (!requestData.user_id || !requestData.tmdb_id || !requestData.season_id || !requestData.episode_id) {
            return json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const record = await pb.collection('favourite_series').getFirstListItem(
            `tmdb_id="${requestData.tmdb_id}" && user_id="${requestData.user_id}"`
        );
        if (!record) {
            return json({ success: false, error: 'Record not found' }, { status: 404 });
        }
        const updateData = {
            season_id: requestData.season_id,
            episode_id: requestData.episode_id,
        };
        const updatedRecord = await pb.collection('favourite_series').update(record.id, updateData);
        return json({ success: true, record_id: updatedRecord.id }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ success: false, error: error.message || 'An error occurred' }, { status: 500 });
    }
}
