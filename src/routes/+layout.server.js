import { db } from '$lib/db/db';
import { moviesBookmark, seriesBookmark, animesBookmark } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ locals }) {
	const user = locals.user;
	let bookmarks = {
		movies: [],
		series: [],
		anime: []
	};

	if (user) {
		try {
			const [movies, series, anime] = await Promise.all([
				db.select({ tmdbId: moviesBookmark.tmdbId }).from(moviesBookmark).where(eq(moviesBookmark.userId, user.id)).all(),
				db.select({ tmdbId: seriesBookmark.tmdbId }).from(seriesBookmark).where(eq(seriesBookmark.userId, user.id)).all(),
				db.select({ tmdbId: animesBookmark.tmdbId }).from(animesBookmark).where(eq(animesBookmark.userId, user.id)).all()
			]);

			bookmarks.movies = movies.map(m => m.tmdbId);
			bookmarks.series = series.map(s => s.tmdbId);
			bookmarks.anime = anime.map(a => a.tmdbId);
		} catch (error) {
			console.error("Error fetching bookmarks for layout:", error);
		}
	}

	return {
		user,
		bookmarks
	};
}

