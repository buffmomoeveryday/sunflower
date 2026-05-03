import { command,getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '../db/db.js';
import {
	moviesBookmark,
	moviesWatchHistory,
	seriesBookmark,
	animesBookmark,
	seriesWatchHistory,
	animesWatchHistory
} from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const strFromApi = v.pipe(
	v.nullish(v.string()),
	v.transform((s) => s ?? '')
);

const voteTextFromApi = v.pipe(
	v.nullish(v.union([v.string(), v.number()])),
	v.transform((x) => (x == null ? '0' : String(x)))
);

const countFromApi = v.pipe(
	v.nullish(v.union([v.string(), v.number()])),
	v.transform((x) => {
		const n = x == null ? 0 : Number(x);
		return Number.isFinite(n) ? n : 0;
	})
);

const optionalSeasonEpisode = v.optional(
	v.pipe(
		v.nullish(v.union([v.string(), v.number()])),
		v.transform((x) => (x == null ? undefined : Number(x)))
	)
);

const optionalServerId = v.optional(
	v.pipe(
		v.nullish(v.union([v.string(), v.number()])),
		v.transform((x) => {
			if (x == null) return undefined;
			const n = Math.floor(Number(x));
			if (!Number.isFinite(n) || n < 1) return undefined;
			return Math.min(n, 99);
		})
	)
);

const movieObject = v.object({
	id: v.union([v.string(), v.number()]),
	poster_path: strFromApi,
	title: strFromApi,
	vote_average: voteTextFromApi,
	release_date: strFromApi,
	genre_ids: v.array(v.union([v.string(), v.number()]))
});

const seriesObject = v.object({
	tmdb_id: v.union([v.string(), v.number()]),
	poster_path: strFromApi,
	name: strFromApi,
	vote_average: voteTextFromApi,
	first_air_date: strFromApi,
	number_of_seasons: countFromApi,
	season_id: optionalSeasonEpisode,
	episode_id: optionalSeasonEpisode,
	server_id: optionalServerId
});

const animeObject = v.object({
	tmdb_id: v.union([v.string(), v.number()]),
	poster: strFromApi,
	name: strFromApi,
	title: strFromApi,
	vote: voteTextFromApi,
	start_date: strFromApi,
	episodes: countFromApi
});

// --- Movie Commands ---
export const toggleMovieBookmark = command(
	movieObject,
	async (
		{ id: tmdbId, poster_path, title, vote_average, release_date, genre_ids },
	) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return { success: false, error: 'User not authenticated' };

		try {
			const existing = await db
				.select()
				.from(moviesBookmark)
				.where(
					and(eq(moviesBookmark.tmdbId, tmdbId.toString()), eq(moviesBookmark.userId, user.id))
				)
				.get();

			if (existing) {
				await db.delete(moviesBookmark).where(eq(moviesBookmark.id, existing.id));
				return { success: true, action: 'removed' };
			} else {
				await db.insert(moviesBookmark).values({
					id: crypto.randomUUID(),
					userId: user.id,
					tmdbId: tmdbId.toString(),
					posterPath: poster_path,
					title: title,
					voteAverage: vote_average,
					releaseDate: release_date,
					genreIds: JSON.stringify(genre_ids)
				});
				return { success: true, action: 'added' };
			}
		} catch (err) {
			console.error('Error toggling movie bookmark:', err);
			return { success: false, error: 'Database error' };
		}
	}
);

export const isMovieBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(moviesBookmark)
				.where(
					and(eq(moviesBookmark.tmdbId, tmdbId.toString()), eq(moviesBookmark.userId, user.id))
				)
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToMovieHistory = command(movieObject, async (movie) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: "Not logged in" };
	try {
		const existing = await db
			.select()
			.from(moviesWatchHistory)
			.where(
				and(
					eq(moviesWatchHistory.tmdbId, movie.id.toString()),
					eq(moviesWatchHistory.userId, user.id)
				)
			)
			.get();
		if (!existing) {
			await db.insert(moviesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId: movie.id.toString(),
				posterPath: movie.poster_path,
				title: movie.title,
				voteAverage: movie.vote_average,
				releaseDate: movie.release_date,
				genreIds: JSON.stringify(movie.genre_ids)
			});
		} else {
			await db.update(moviesWatchHistory)
				.set({ createdAt: new Date() })
				.where(eq(moviesWatchHistory.id, existing.id));
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Series Commands ---
export const toggleSeriesBookmark = command(seriesObject, async (series) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: 'User not authenticated' };
	const tmdbId = series.tmdb_id.toString();

	try {
		const existing = await db
			.select()
			.from(seriesBookmark)
			.where(and(eq(seriesBookmark.tmdbId, tmdbId), eq(seriesBookmark.userId, user.id)))
			.get();

		if (existing) {
			await db.delete(seriesBookmark).where(eq(seriesBookmark.id, existing.id));
			return { success: true, action: 'removed' };
		} else {
			await db.insert(seriesBookmark).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				posterPath: series.poster_path,
				name: series.name,
				voteAverage: series.vote_average,
				firstAirDate: series.first_air_date,
				numberOfSeasons: series.number_of_seasons
			});
			return { success: true, action: 'added' };
		}
	} catch (err) {
		console.error('Error toggling series bookmark:', err);
		return { success: false, error: 'Database error' };
	}
});

export const isSeriesBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(seriesBookmark)
				.where(and(eq(seriesBookmark.tmdbId, tmdbId.toString()), eq(seriesBookmark.userId, user.id)))
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToSeriesHistory = command(seriesObject, async (series) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: "Not logged in" };
	const tmdbId = series.tmdb_id.toString();
	const nextServer =
		series.server_id != null ? Number(series.server_id) : undefined;
	const clampServer = (n) =>
		(Number.isFinite(n) ? Math.min(99, Math.max(1, Math.floor(n))) : 1);
	try {
		const existing = await db
			.select()
			.from(seriesWatchHistory)
			.where(and(eq(seriesWatchHistory.tmdbId, tmdbId), eq(seriesWatchHistory.userId, user.id)))
			.get();
		if (!existing) {
			await db.insert(seriesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				posterPath: series.poster_path,
				name: series.name,
				voteAverage: series.vote_average,
				firstAirDate: series.first_air_date,
				numberOfSeasons: series.number_of_seasons,
				seasonId: series.season_id ? Number(series.season_id) : 1,
				episodeId: series.episode_id ? Number(series.episode_id) : 1,
				serverId: nextServer != null ? clampServer(nextServer) : 1
			});
		} else {
			const resolvedServer =
				nextServer != null ? clampServer(nextServer) : existing.serverId;
			await db.update(seriesWatchHistory)
				.set({
					seasonId: series.season_id ? Number(series.season_id) : existing.seasonId,
					episodeId: series.episode_id ? Number(series.episode_id) : existing.episodeId,
					serverId: resolvedServer,
					createdAt: new Date()
				})
				.where(eq(seriesWatchHistory.id, existing.id));
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Anime Commands ---
export const toggleAnimeBookmark = command(animeObject, async (anime) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: 'User not authenticated' };
	const tmdbId = anime.tmdb_id.toString();

	try {
		const existing = await db
			.select()
			.from(animesBookmark)
			.where(and(eq(animesBookmark.tmdbId, tmdbId), eq(animesBookmark.userId, user.id)))
			.get();

		if (existing) {
			await db.delete(animesBookmark).where(eq(animesBookmark.id, existing.id));
			return { success: true, action: 'removed' };
		} else {
			await db.insert(animesBookmark).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				poster: anime.poster,
				name: anime.name,
				vote: anime.vote,
				startDate: anime.start_date,
				title: anime.title,
				episodes: anime.episodes
			});
			return { success: true, action: 'added' };
		}
	} catch (err) {
		console.error('Error toggling anime bookmark:', err);
		return { success: false, error: 'Database error' };
	}
});

export const isAnimeBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(animesBookmark)
				.where(and(eq(animesBookmark.tmdbId, tmdbId.toString()), eq(animesBookmark.userId, user.id)))
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToAnimeHistory = command(animeObject, async (anime) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	const tmdbId = anime.tmdb_id.toString();
	try {
		const existing = await db
			.select()
			.from(animesWatchHistory)
			.where(and(eq(animesWatchHistory.tmdbId, tmdbId), eq(animesWatchHistory.userId, user.id)))
			.get();
		if (!existing) {
			await db.insert(animesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				poster: anime.poster,
				name: anime.name,
				vote: anime.vote,
				startDate: anime.start_date,
				title: anime.title,
				episodes: anime.episodes
			});
		} else {
			await db.update(animesWatchHistory)
				.set({ createdAt: new Date() })
				.where(eq(animesWatchHistory.id, existing.id));
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Fetch & Remove Commands ---
export const getBookmarkedMovies = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(moviesBookmark)
			.where(eq(moviesBookmark.userId, user.id))
			.orderBy(desc(moviesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.tmdbId,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			release_date: m.releaseDate,
			genre_ids: m.genreIds ? JSON.parse(m.genreIds) : []
		}));

	} catch (err) {
		return [];
	}
});

export const getBookmarkedSeries = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(seriesBookmark)
			.where(eq(seriesBookmark.userId, user.id))
			.orderBy(desc(seriesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.tmdbId,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			first_air_date: m.firstAirDate,
			number_of_seasons: m.numberOfSeasons
		}));
	} catch (err) {
		return [];
	}
});

export const getBookmarkedAnime = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(animesBookmark)
			.where(eq(animesBookmark.userId, user.id))
			.orderBy(desc(animesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.tmdbId,
			tmdb_id: m.tmdbId
		}));
	} catch (err) {
		return [];
	}
});

export const getMoviesHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(moviesWatchHistory)
			.where(eq(moviesWatchHistory.userId, user.id))
			.orderBy(desc(moviesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id, 
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			title: m.title,
			vote_average: m.voteAverage,
			release_date: m.releaseDate,
			genre_ids: m.genreIds ? JSON.parse(m.genreIds) : []
		}));

	} catch (err) {
		return [];
	}
});

export const getSeriesHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(seriesWatchHistory)
			.where(eq(seriesWatchHistory.userId, user.id))
			.orderBy(desc(seriesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			first_air_date: m.firstAirDate,
			number_of_seasons: m.numberOfSeasons,
			season_id: m.seasonId,
			episode_id: m.episodeId,
			server_id: m.serverId
		}));
	} catch (err) {
		return [];
	}
});

export const getAnimeHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(animesWatchHistory)
			.where(eq(animesWatchHistory.userId, user.id))
			.orderBy(desc(animesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId
		}));
	} catch (err) {
		return [];
	}
});

export const removeMovieHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(moviesWatchHistory).where(and(eq(moviesWatchHistory.id, id), eq(moviesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

export const removeSeriesHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(seriesWatchHistory).where(and(eq(seriesWatchHistory.id, id), eq(seriesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

export const removeAnimeHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(animesWatchHistory).where(and(eq(animesWatchHistory.id, id), eq(animesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});