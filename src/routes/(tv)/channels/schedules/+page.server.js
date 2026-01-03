import { parseDaddySchedule } from '$lib/utils/parseDaddyHtml';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const schedules = await parseDaddySchedule();
    return { schedules };
}
