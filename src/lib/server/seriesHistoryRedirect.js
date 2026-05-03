import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { seriesWatchHistory } from '$lib/db/schema.js';
import { and, eq } from 'drizzle-orm';

export function urlHasPlaybackParams(url) {
	return (
		url.searchParams.has('season') ||
		url.searchParams.has('episode') ||
		url.searchParams.has('server_id')
	);
}

export async function redirectIfSavedSeriesProgress(url, locals, seriesId) {
	if (!locals?.user || urlHasPlaybackParams(url)) return;

	let row;
	try {
		row = await db
			.select()
			.from(seriesWatchHistory)
			.where(
				and(
					eq(seriesWatchHistory.tmdbId, String(seriesId)),
					eq(seriesWatchHistory.userId, locals.user.id)
				)
			)
			.get();
	} catch (err) {
		console.warn('[seriesHistoryRedirect] lookup failed:', err?.message);
		return;
	}

	if (!row) return;

	const dest = new URL(url.href);
	dest.searchParams.set('season', String(row.seasonId ?? 1));
	dest.searchParams.set('episode', String(row.episodeId ?? 1));
	dest.searchParams.set('server_id', String(row.serverId ?? 1));
	throw redirect(302, dest.pathname + dest.search);
}
